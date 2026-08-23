import { get, post, put, patch, del } from '../api'
import { getAuthHeaders } from '../auth'
import { getPlatformAuthHeaders } from '../platformAuth'
import type { ApiClient } from '../superAdminClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'
const CONTROLE_BASE_URL = process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export interface CategoryCharacteristic {
  id: number
  name: string
  attributes: Record<string, string>
}

export interface Category {
  id: number
  name: string
  type: 'boisson' | 'nourriture' | 'service'
  characteristics?: CategoryCharacteristic[]
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  category: number | null
  category_name?: string
  name: string
  sku: string
  unit: 'unite' | 'bouteille' | 'casier' | 'plat' | 'portion' | 'service'
  price: string
  crate_price?: string | number | null
  is_active: boolean
  brand: string
  alcohol_percentage: string | null
  volume_cl: number | null
  attributes: Record<string, any>
  photo?: string | null
  stock?: number
  min_stock?: number
  initial_stock?: number
  initial_min_stock?: number
  units_per_package?: number
  packagings?: ProductPackaging[]
  created_at?: string
  updated_at?: string
}

export interface ProductVariant {
  id: number
  product: number
  name: string
  price_override: string | null
  price: string
}

export interface QrMenuSettings {
  enabled: boolean
  slug: string | null
  menu_url: string | null
}

export interface ProductPackaging {
  id: number
  product: number
  name: string
  units_per_package: number
  is_default: boolean
}

/**
 * Toutes les operations du catalogue, parametrees par le client HTTP a
 * utiliser. `(dashboard)` utilise le client par defaut (`lib/api.ts`, scope
 * a l'etablissement du gerant connecte) via les exports nommes ci-dessous ;
 * `super-admin` injecte `createSuperAdminClient(instanceCode)` pour cibler
 * l'etablissement choisi sans dupliquer cette logique.
 */
export function createCatalogApi(client: ApiClient) {
  return {
    // Categories
    getCategories: () => client.get<Category[]>('/catalog/categories/'),
    createCategory: (data: Partial<Category>) => client.post<Category>('/catalog/categories/', data),
    updateCategory: (id: number, data: Partial<Category>) => client.put<Category>(`/catalog/categories/${id}/`, data),
    deleteCategory: (id: number) => client.del(`/catalog/categories/${id}/`),

    // Category Characteristics
    getCategoryCharacteristics: (categoryId: number) => client.get<CategoryCharacteristic[]>(`/catalog/categories/${categoryId}/characteristics/`),
    createCategoryCharacteristic: (categoryId: number, data: Partial<CategoryCharacteristic>) => client.post<CategoryCharacteristic>(`/catalog/categories/${categoryId}/characteristics/`, data),
    deleteCategoryCharacteristic: (categoryId: number, charId: number) => client.del(`/catalog/categories/${categoryId}/characteristics/${charId}/`),

    // Products
    getProducts: () => client.get<Product[]>('/catalog/products/'),
    createProduct: (data: Partial<Product>) => client.post<Product>('/catalog/products/', data),
    updateProduct: (id: number, data: Partial<Product>) => client.put<Product>(`/catalog/products/${id}/`, data),
    deleteProduct: (id: number) => client.del<void>(`/catalog/products/${id}/`),

    // Variants
    getProductVariants: (productId: number) => client.get<ProductVariant[]>(`/catalog/products/${productId}/variants/`),
    createProductVariant: (productId: number, data: Partial<ProductVariant>) => client.post<ProductVariant>(`/catalog/products/${productId}/variants/`, data),
    updateProductVariant: (productId: number, variantId: number, data: Partial<ProductVariant>) => client.put<ProductVariant>(`/catalog/products/${productId}/variants/${variantId}/`, data),
    deleteProductVariant: (productId: number, variantId: number) => client.del<void>(`/catalog/products/${productId}/variants/${variantId}/`),

    // Packagings
    getProductPackagings: (productId: number) => client.get<ProductPackaging[]>(`/catalog/products/${productId}/packagings/`),
    createProductPackaging: (productId: number, data: Partial<ProductPackaging>) => client.post<ProductPackaging>(`/catalog/products/${productId}/packagings/`, data),
    updateProductPackaging: (productId: number, packagingId: number, data: Partial<ProductPackaging>) => client.put<ProductPackaging>(`/catalog/products/${productId}/packagings/${packagingId}/`, data),
    deleteProductPackaging: (productId: number, packagingId: number) => client.del<void>(`/catalog/products/${productId}/packagings/${packagingId}/`),

    // Menu par QR code
    getQrMenuSettings: () => client.get<QrMenuSettings>('/catalog/qr-menu/'),
    enableQrMenu: () => client.post<QrMenuSettings>('/catalog/qr-menu/', {}),
    disableQrMenu: () => client.del<QrMenuSettings>('/catalog/qr-menu/'),
  }
}

const defaultCatalogApi = createCatalogApi({ get, post, put, patch, del })

export const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getCategoryCharacteristics, createCategoryCharacteristic, deleteCategoryCharacteristic,
  getProducts, createProduct, updateProduct, deleteProduct,
  getProductVariants, createProductVariant, updateProductVariant, deleteProductVariant,
  getProductPackagings, createProductPackaging, updateProductPackaging, deleteProductPackaging,
  getQrMenuSettings, enableQrMenu, disableQrMenu,
} = defaultCatalogApi

async function parsePhotoResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message = (data as Record<string, unknown>)?.detail as string
      ?? Object.values(data as Record<string, string[]>).flat().join(' ')
      ?? "Erreur lors de l'envoi de la photo."
    throw new Error(message || "Erreur lors de l'envoi de la photo.")
  }
  return res.json()
}

/**
 * Upload/remplacement de la photo d'un produit — multipart (ImageField cote
 * backend, incompatible avec le client JSON `ApiClient`), meme principe que
 * uploadVerificationDocument dans lib/api/companies.ts. `photo: null` (pas
 * de fichier joint) reste possible via updateProduct classique pour les
 * autres champs, cette fonction ne gere que le remplacement de l'image.
 */
export async function uploadProductPhoto(productId: number, file: File): Promise<Product> {
  const formData = new FormData()
  formData.append('photo', file)
  const res = await fetch(`${API_BASE_URL}/catalog/products/${productId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
  return parsePhotoResponse<Product>(res)
}

export async function uploadInstanceProductPhoto(
  instanceCode: string, companyId: number, productId: number, file: File,
): Promise<Product> {
  const formData = new FormData()
  formData.append('photo', file)
  const res = await fetch(
    `${CONTROLE_BASE_URL}/proxy/${instanceCode}/catalog/products/${productId}/?company_id=${companyId}`,
    { method: 'PATCH', headers: getPlatformAuthHeaders(), body: formData },
  )
  return parsePhotoResponse<Product>(res)
}
