export interface CountryInfo {
  code: string
  prefix: string
  name: string
  timezone: string
}

export const countriesData: CountryInfo[] = [
  // Afrique
  { code: 'GA', prefix: '+241', name: 'Gabon', timezone: 'Africa/Libreville' },
  { code: 'CM', prefix: '+237', name: 'Cameroun', timezone: 'Africa/Douala' },
  { code: 'SN', prefix: '+221', name: 'Sénégal', timezone: 'Africa/Dakar' },
  { code: 'CI', prefix: '+225', name: 'Côte d\'Ivoire', timezone: 'Africa/Abidjan' },
  { code: 'CG', prefix: '+242', name: 'Congo-Brazzaville', timezone: 'Africa/Brazzaville' },
  { code: 'CD', prefix: '+243', name: 'RDC (Congo-Kinshasa)', timezone: 'Africa/Kinshasa' },
  { code: 'TG', prefix: '+228', name: 'Togo', timezone: 'Africa/Lome' },
  { code: 'BJ', prefix: '+229', name: 'Bénin', timezone: 'Africa/Porto-Novo' },
  { code: 'NE', prefix: '+227', name: 'Niger', timezone: 'Africa/Niamey' },
  { code: 'ML', prefix: '+223', name: 'Mali', timezone: 'Africa/Bamako' },
  { code: 'BF', prefix: '+226', name: 'Burkina Faso', timezone: 'Africa/Ouagadougou' },
  { code: 'GN', prefix: '+224', name: 'Guinée', timezone: 'Africa/Conakry' },
  { code: 'CF', prefix: '+236', name: 'République Centrafricaine', timezone: 'Africa/Bangui' },
  { code: 'TD', prefix: '+235', name: 'Tchad', timezone: 'Africa/Ndjamena' },
  { code: 'MA', prefix: '+212', name: 'Maroc', timezone: 'Africa/Casablanca' },
  { code: 'DZ', prefix: '+213', name: 'Algérie', timezone: 'Africa/Algiers' },
  { code: 'TN', prefix: '+216', name: 'Tunisie', timezone: 'Africa/Tunis' },
  { code: 'EG', prefix: '+20', name: 'Égypte', timezone: 'Africa/Cairo' },
  { code: 'NG', prefix: '+234', name: 'Nigeria', timezone: 'Africa/Lagos' },
  { code: 'GH', prefix: '+233', name: 'Ghana', timezone: 'Africa/Accra' },
  { code: 'KE', prefix: '+254', name: 'Kenya', timezone: 'Africa/Nairobi' },
  { code: 'ZA', prefix: '+27', name: 'Afrique du Sud', timezone: 'Africa/Johannesburg' },
  { code: 'MG', prefix: '+261', name: 'Madagascar', timezone: 'Indian/Antananarivo' },
  { code: 'MU', prefix: '+230', name: 'Maurice', timezone: 'Indian/Mauritius' },
  { code: 'MR', prefix: '+222', name: 'Mauritanie', timezone: 'Africa/Nouakchott' },
  { code: 'GQ', prefix: '+240', name: 'Guinée Équatoriale', timezone: 'Africa/Malabo' },
  { code: 'BI', prefix: '+257', name: 'Burundi', timezone: 'Africa/Bujumbura' },
  { code: 'RW', prefix: '+250', name: 'Rwanda', timezone: 'Africa/Kigali' },
  { code: 'SC', prefix: '+248', name: 'Seychelles', timezone: 'Indian/Mahe' },
  { code: 'DJ', prefix: '+253', name: 'Djibouti', timezone: 'Africa/Djibouti' },
  { code: 'AO', prefix: '+244', name: 'Angola', timezone: 'Africa/Luanda' },
  { code: 'MZ', prefix: '+258', name: 'Mozambique', timezone: 'Africa/Maputo' },
  { code: 'CV', prefix: '+238', name: 'Cap-Vert', timezone: 'Atlantic/Cape_Verde' },

  // Europe
  { code: 'FR', prefix: '+33', name: 'France', timezone: 'Europe/Paris' },
  { code: 'BE', prefix: '+32', name: 'Belgique', timezone: 'Europe/Brussels' },
  { code: 'CH', prefix: '+41', name: 'Suisse', timezone: 'Europe/Zurich' },
  { code: 'LU', prefix: '+352', name: 'Luxembourg', timezone: 'Europe/Luxembourg' },
  { code: 'MC', prefix: '+377', name: 'Monaco', timezone: 'Europe/Monaco' },
  { code: 'GB', prefix: '+44', name: 'Royaume-Uni', timezone: 'Europe/London' },
  { code: 'DE', prefix: '+49', name: 'Allemagne', timezone: 'Europe/Berlin' },
  { code: 'ES', prefix: '+34', name: 'Espagne', timezone: 'Europe/Madrid' },
  { code: 'IT', prefix: '+39', name: 'Italie', timezone: 'Europe/Rome' },
  { code: 'PT', prefix: '+351', name: 'Portugal', timezone: 'Europe/Lisbon' },
  { code: 'NL', prefix: '+31', name: 'Pays-Bas', timezone: 'Europe/Amsterdam' },

  // Amériques
  { code: 'CA', prefix: '+1', name: 'Canada', timezone: 'America/Toronto' },
  { code: 'US', prefix: '+1', name: 'États-Unis', timezone: 'America/New_York' },
  { code: 'HT', prefix: '+509', name: 'Haïti', timezone: 'America/Port-au-Prince' },
  { code: 'GP', prefix: '+590', name: 'Guadeloupe', timezone: 'America/Marigot' },
  { code: 'MQ', prefix: '+596', name: 'Martinique', timezone: 'America/Fort-de-France' },
  { code: 'GF', prefix: '+594', name: 'Guyane Française', timezone: 'America/Cayenne' },
  { code: 'BR', prefix: '+55', name: 'Brésil', timezone: 'America/Sao_Paulo' },
  { code: 'AR', prefix: '+54', name: 'Argentine', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'MX', prefix: '+52', name: 'Mexique', timezone: 'America/Mexico_City' },

  // Asie / Océanie
  { code: 'CN', prefix: '+86', name: 'Chine', timezone: 'Asia/Shanghai' },
  { code: 'JP', prefix: '+81', name: 'Japon', timezone: 'Asia/Tokyo' },
  { code: 'IN', prefix: '+91', name: 'Inde', timezone: 'Asia/Kolkata' },
  { code: 'AE', prefix: '+971', name: 'Émirats Arabes Unis', timezone: 'Asia/Dubai' },
  { code: 'SA', prefix: '+966', name: 'Arabie Saoudite', timezone: 'Asia/Riyadh' },
  { code: 'LB', prefix: '+961', name: 'Liban', timezone: 'Asia/Beirut' },
  { code: 'IL', prefix: '+972', name: 'Israël', timezone: 'Asia/Jerusalem' },
  { code: 'TR', prefix: '+90', name: 'Turquie', timezone: 'Europe/Istanbul' },
  { code: 'AU', prefix: '+61', name: 'Australie', timezone: 'Australia/Sydney' },
  { code: 'NZ', prefix: '+64', name: 'Nouvelle-Zélande', timezone: 'Pacific/Auckland' },
]

export const timezonesList: string[] = [
  'Africa/Libreville',
  'Africa/Douala',
  'Africa/Dakar',
  'Africa/Abidjan',
  'Africa/Brazzaville',
  'Africa/Kinshasa',
  'Africa/Lome',
  'Africa/Porto-Novo',
  'Africa/Niamey',
  'Africa/Bamako',
  'Africa/Ouagadougou',
  'Africa/Conakry',
  'Africa/Bangui',
  'Africa/Ndjamena',
  'Africa/Casablanca',
  'Africa/Algiers',
  'Africa/Tunis',
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Accra',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Nouakchott',
  'Africa/Malabo',
  'Africa/Bujumbura',
  'Africa/Kigali',
  'Africa/Luanda',
  'Africa/Maputo',
  'Indian/Antananarivo',
  'Indian/Mauritius',
  'Indian/Mahe',
  'Atlantic/Cape_Verde',
  'Europe/Paris',
  'Europe/Brussels',
  'Europe/Zurich',
  'Europe/Luxembourg',
  'Europe/Monaco',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Lisbon',
  'Europe/Amsterdam',
  'Europe/Istanbul',
  'America/Toronto',
  'America/New_York',
  'America/Port-au-Prince',
  'America/Marigot',
  'America/Fort-de-France',
  'America/Cayenne',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Beirut',
  'Asia/Jerusalem',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export const splitPhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { prefix: '+241', number: '' }
  const cleanPhone = fullPhone.trim()
  
  // Chercher une correspondance exacte avec nos indicatifs
  // Trier les pays par longueur de préfixe décroissante pour éviter les conflits (ex: +1 contre +1246)
  const sortedCountries = [...countriesData].sort((a, b) => b.prefix.length - a.prefix.length)
  const match = sortedCountries.find(c => cleanPhone.startsWith(c.prefix))
  
  if (match) {
    return { prefix: match.prefix, number: cleanPhone.slice(match.prefix.length).trim() }
  }
  
  const prefixMatch = cleanPhone.match(/^(\+\d{1,4})/)
  if (prefixMatch) {
    return { prefix: prefixMatch[1], number: cleanPhone.slice(prefixMatch[1].length).trim() }
  }
  
  return { prefix: '+241', number: cleanPhone }
}
