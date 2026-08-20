import type { MetadataRoute } from 'next'

// RL9-16 (audit RL SERVICES 2026-08-18) : ne référence que les pages
// publiques réellement destinées à être indexées.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://noxia.ga'
  const now = new Date()

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
