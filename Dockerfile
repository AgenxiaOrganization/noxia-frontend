# syntax=docker/dockerfile:1

# ---- Stage 1 : dependances -------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2 : build --------------------------------------------------------
# NEXT_PUBLIC_* sont des variables BUILD-TIME en Next.js : elles sont
# embarquees dans le bundle JS au moment de `next build`, jamais relues au
# demarrage du container. Elles doivent donc arriver ici via --build-arg,
# pas seulement dans le docker-compose.yml du service final.
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CONTROLE_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_CONTROLE_API_URL=${NEXT_PUBLIC_CONTROLE_API_URL} \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Stage 3 : image finale (standalone) -----------------------------------
FROM node:22-alpine AS final
WORKDIR /app

# node:alpine embarque deja un utilisateur/groupe "node" (uid/gid 1000) —
# on le reutilise plutot que d'en creer un nouveau (collision de gid sinon).
RUN apk add --no-cache curl

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# `standalone` ne copie que server.js + les node_modules effectivement
# utilises au runtime (voir next.config.ts output: "standalone") — image
# nettement plus legere qu'un node_modules complet.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
