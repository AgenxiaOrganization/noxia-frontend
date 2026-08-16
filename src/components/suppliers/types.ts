export interface SupplierProductRef {
  id: number
  name: string
  supplier: number | null
  category_name?: string
  price?: string | number
  stock_item?: { quantity_on_hand: string | number; alert_threshold: string | number }
}
