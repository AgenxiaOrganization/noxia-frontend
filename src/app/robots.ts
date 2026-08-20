import type { MetadataRoute } from 'next'

// RL9-16 (audit RL SERVICES 2026-08-18) : hygiène de base attendue par les
// crawlers — n'indexe que la landing publique, jamais le dashboard/back-office
// (déjà protégés par authentification, mais autant ne pas les référencer).
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://noxia.ga'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/super-admin', '/super-admin-login', '/settings'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
