export interface ProductCardData {
  id: number
  name: string
  category: string
  subCategory: string
  pricePerUnit: number
  stock: number
  unit?: string
  minStock?: number
  characteristics?: Record<string, string>
  photo?: string | null
}
