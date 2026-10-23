import { get, post, put, patch, del } from '../api'
import type { ApiClient } from '../superAdminClient'

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
  movement_type: 'entry' | 'exit' | 'adjustment' | 'loss'
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
  source?: 'web' | 'whatsapp' | 'telegram' | 'bot_web' | string
  source_display?: string
  products_list: { name: string; quantity: string | number }[] | any
  message?: string
  total_amount: number | string
  created_at: string
  updated_at?: string
}

/**
 * Voir `catalog.ts` : meme principe d'injection de client, pour que
 * `super-admin` reutilise cette logique sans la dupliquer.
 */
/** Réponse paginée du backend (`?page=` / `?page_size=`). */
export interface Page<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export function createInventoryApi(client: ApiClient) {
  return {
    // Stock Items
    getStockItems: () => client.get<StockItem[]>('/inventory/stock-items/'),
    getStockItem: (id: number) => client.get<StockItem>(`/inventory/stock-items/${id}/`),
    patchStockItem: (id: number, data: Partial<StockItem>) => client.patch<StockItem>(`/inventory/stock-items/${id}/`, data),

    // Movements
    /** Sans argument : tout l'historique. `latest` : seulement les N derniers mouvements (une page). */
    getStockMovements: async (latest?: number): Promise<StockMovement[]> => {
      if (!latest) return client.get<StockMovement[]>('/inventory/movements/')
      const page = await client.get<Page<StockMovement>>(`/inventory/movements/?page_size=${latest}`)
      return page.results ?? []
    },
    createStockMovement: (data: Partial<StockMovement>) => client.post<StockMovement>('/inventory/movements/', data),

    // Suppliers
    getSuppliers: () => client.get<Supplier[]>('/inventory/suppliers/'),
    createSupplier: (data: Partial<Supplier>) => client.post<Supplier>('/inventory/suppliers/', data),
    updateSupplier: (id: number, data: Partial<Supplier>) => client.put<Supplier>(`/inventory/suppliers/${id}/`, data as any),
    deleteSupplier: (id: number) => client.del<void>(`/inventory/suppliers/${id}/`),
    contactSupplier: (id: number, data: { message: string; products: { name: string; quantity: string | number }[] }) =>
      client.post<{ detail: string }>(`/inventory/suppliers/${id}/contact/`, data),

    // Supplier Orders
    getSupplierOrders: () => client.get<SupplierOrder[]>('/inventory/supplier-orders/'),
    /** Une page de commandes, des plus récentes aux plus anciennes. */
    getSupplierOrdersPage: (page = 1, pageSize = 25) =>
      client.get<Page<SupplierOrder>>(`/inventory/supplier-orders/?page=${page}&page_size=${pageSize}`),
    createSupplierOrder: (data: Partial<SupplierOrder>) => client.post<SupplierOrder>('/inventory/supplier-orders/', data as any),
    updateSupplierOrderStatus: (id: number, status: 'pending' | 'shipped' | 'delivered') =>
      client.patch<SupplierOrder>(`/inventory/supplier-orders/${id}/`, { status } as any),
    deleteSupplierOrder: (id: number) => client.del<void>(`/inventory/supplier-orders/${id}/`),
    bulkDeleteSupplierOrders: (ids: number[]) => client.post<{ detail: string }>('/inventory/supplier-orders/bulk-delete/', { ids }),
  }
}

const defaultInventoryApi = createInventoryApi({ get, post, put, patch, del })

export const {
  getStockItems, getStockItem, patchStockItem,
  getStockMovements, createStockMovement,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier, contactSupplier,
  getSupplierOrders, getSupplierOrdersPage, createSupplierOrder, updateSupplierOrderStatus, deleteSupplierOrder, bulkDeleteSupplierOrders,
} = defaultInventoryApi
