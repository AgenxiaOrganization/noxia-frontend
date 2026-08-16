export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  unit: string
  subCategory?: string
  unitsPerPackage?: number
  photo?: string | null
}

export interface CartItem {
  productId: number
  qty: number
}
