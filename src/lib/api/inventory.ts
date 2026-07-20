import { get, post, put, patch, del } from '../api'

export interface StockItem {
  id: number
  product: number
  product_name?: string
  unit?: string
  quantity_on_hand: number | string
  alert_threshold: number | string
  is_low_stock?: boolean
  packaging_breakdown?: {
    packaging: string
    units_per_package: number
    full_packages: string | number
    remainder: string | number
  }[]
  updated_at?: string
}

export interface StockMovement {
  id: number
  stock_item: number
  product_name?: string
  movement_type: 'entry' | 'exit' | 'adjustment'
  quantity: number | string
  packaging?: number | null
  packaging_name?: string | null
  packaging_quantity?: number | string | null
  reason?: string
  created_by?: number | null
  created_by_name?: string | null
  created_at?: string
}

export interface Supplier {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  product_ids?: number[]
}

export interface SupplierOrder {
  id: number
  supplier: number
  supplier_name: string
  status: 'pending' | 'shipped' | 'delivered'
  products_list: { name: string; quantity: string | number }[]
  message?: string
  total_amount: number | string
  created_at: string
  updated_at?: string
}


// Stock Items
export const getStockItems = () => get<StockItem[]>('/inventory/stock-items/')
export const getStockItem = (id: number) => get<StockItem>(`/inventory/stock-items/${id}/`)
export const patchStockItem = (id: number, data: Partial<StockItem>) => patch<StockItem>(`/inventory/stock-items/${id}/`, data)

// Movements
export const getStockMovements = () => get<StockMovement[]>('/inventory/movements/')
export const createStockMovement = (data: Partial<StockMovement>) => post<StockMovement>('/inventory/movements/', data)

// Suppliers
export const getSuppliers = () => get<Supplier[]>('/inventory/suppliers/')
export const createSupplier = (data: Partial<Supplier>) => post<Supplier>('/inventory/suppliers/', data)
export const updateSupplier = (id: number, data: Partial<Supplier>) => put<Supplier>(`/inventory/suppliers/${id}/`, data as any)
export const deleteSupplier = (id: number) => del<void>(`/inventory/suppliers/${id}/`)
export const contactSupplier = (id: number, data: { message: string; products: { name: string; quantity: string | number }[] }) => 
  post<{ detail: string }>(`/inventory/suppliers/${id}/contact/`, data)

// Supplier Orders
export const getSupplierOrders = () => get<SupplierOrder[]>('/inventory/supplier-orders/')
export const createSupplierOrder = (data: Partial<SupplierOrder>) => post<SupplierOrder>('/inventory/supplier-orders/', data as any)
export const updateSupplierOrderStatus = (id: number, status: 'pending' | 'shipped' | 'delivered') => 
  patch<SupplierOrder>(`/inventory/supplier-orders/${id}/`, { status } as any)
export const deleteSupplierOrder = (id: number) => del<void>(`/inventory/supplier-orders/${id}/`)
export const bulkDeleteSupplierOrders = (ids: number[]) => post<{ detail: string }>('/inventory/supplier-orders/bulk-delete/', { ids })


