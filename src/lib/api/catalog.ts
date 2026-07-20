import { get, post, put, del } from '../api'

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
  is_active: boolean
  brand: string
  alcohol_percentage: string | null
  volume_cl: number | null
  attributes: Record<string, any>
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

export interface ProductPackaging {
  id: number
  product: number
  name: string
  units_per_package: number
  is_default: boolean
}

// Categories
export const getCategories = () => get<Category[]>('/catalog/categories/')
export const createCategory = (data: Partial<Category>) => post<Category>('/catalog/categories/', data)
export const updateCategory = (id: number, data: Partial<Category>) => put<Category>(`/catalog/categories/${id}/`, data)
export const deleteCategory = (id: number) => del(`/catalog/categories/${id}/`)

// Category Characteristics
export const getCategoryCharacteristics = (categoryId: number) => get<CategoryCharacteristic[]>(`/catalog/categories/${categoryId}/characteristics/`)
export const createCategoryCharacteristic = (categoryId: number, data: Partial<CategoryCharacteristic>) => post<CategoryCharacteristic>(`/catalog/categories/${categoryId}/characteristics/`, data)
export const deleteCategoryCharacteristic = (categoryId: number, charId: number) => del(`/catalog/categories/${categoryId}/characteristics/${charId}/`)

// Products
export const getProducts = () => get<Product[]>('/catalog/products/')
export const createProduct = (data: Partial<Product>) => post<Product>('/catalog/products/', data)
export const updateProduct = (id: number, data: Partial<Product>) => put<Product>(`/catalog/products/${id}/`, data)
export const deleteProduct = (id: number) => del<void>(`/catalog/products/${id}/`)

// Variants
export const getProductVariants = (productId: number) => get<ProductVariant[]>(`/catalog/products/${productId}/variants/`)
export const createProductVariant = (productId: number, data: Partial<ProductVariant>) => post<ProductVariant>(`/catalog/products/${productId}/variants/`, data)
export const updateProductVariant = (productId: number, variantId: number, data: Partial<ProductVariant>) => put<ProductVariant>(`/catalog/products/${productId}/variants/${variantId}/`, data)
export const deleteProductVariant = (productId: number, variantId: number) => del<void>(`/catalog/products/${productId}/variants/${variantId}/`)

// Packagings
export const getProductPackagings = (productId: number) => get<ProductPackaging[]>(`/catalog/products/${productId}/packagings/`)
export const createProductPackaging = (productId: number, data: Partial<ProductPackaging>) => post<ProductPackaging>(`/catalog/products/${productId}/packagings/`, data)
export const updateProductPackaging = (productId: number, packagingId: number, data: Partial<ProductPackaging>) => put<ProductPackaging>(`/catalog/products/${productId}/packagings/${packagingId}/`, data)
export const deleteProductPackaging = (productId: number, packagingId: number) => del<void>(`/catalog/products/${productId}/packagings/${packagingId}/`)
