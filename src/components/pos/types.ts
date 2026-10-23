export interface PosFormula {
  id: number
  name: string
  unitsSold: number
  price: number
}

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
  /** Formules actives seulement (ex: "Pack 3" = 3 unités à prix fixe). */
  formulas?: PosFormula[]
}

export interface CartItem {
  productId: number
  /** null = vente à l'unité ; sinon `qty` est le nombre de formules. */
  formulaId: number | null
  qty: number
}

export const cartKey = (item: Pick<CartItem, 'productId' | 'formulaId'>) => `${item.productId}-${item.formulaId ?? 'u'}`
