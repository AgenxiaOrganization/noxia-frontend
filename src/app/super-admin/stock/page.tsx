'use client'

import { useContext, useEffect, useState } from 'react'
import { Globe, Building2 } from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import { createCatalogApi, type Product as CatalogProduct } from '@/lib/api/catalog'
import { createInventoryApi, type StockItem } from '@/lib/api/inventory'
import { ensureArray } from '@/lib/api'
import StockTable, { type StockRow } from '@/components/products/StockTable'
import StockAdjustmentModal, { type StockAdjustmentPayload } from '@/components/products/StockAdjustmentModal'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

function mapStockRow(p: CatalogProduct, stockItemsMap: Map<number, StockItem>): StockRow {
  const isCasier = p.packagings && p.packagings.length > 0 && p.packagings[0].name === 'Casier'
  const stockItem = stockItemsMap.get(p.id)

  return {
    id: p.id,
    name: p.name,
    category: p.category_name || 'boisson',
    subCategory: isCasier ? 'casier' : 'unite',
    stock: stockItem ? parseFloat(stockItem.quantity_on_hand as string) : (p.stock ?? 0),
    minStock: stockItem ? parseFloat(stockItem.alert_threshold as string) : (p.min_stock ?? 10),
    maxStock: stockItem ? parseFloat(stockItem.alert_threshold as string) * 5 : 100,
    unit: p.unit || 'unité',
    cost: parseFloat(p.price),
    supplier: null,
    unitsPerPackage: isCasier ? p.packagings![0].units_per_package : 1,
    stockItemId: stockItem ? stockItem.id : null,
  }
}

export default function SuperAdminStock() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [rows, setRows] = useState<StockRow[]>([])
  const [rawProducts, setRawProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adjustmentTarget, setAdjustmentTarget] = useState<{ row: StockRow; type: 'add' | 'remove' } | null>(null)

  const loadData = () => {
    if (isGlobalMode || !selectedCompany) {
      setRows([])
      setRawProducts([])
      return
    }

    let cancelled = false
    const client = createSuperAdminClient(selectedServer.id, selectedCompany.id)
    const catalogApi = createCatalogApi(client)
    const inventoryApi = createInventoryApi(client)

    setIsLoading(true)
    setError(null)
    Promise.all([catalogApi.getProducts(), inventoryApi.getStockItems()])
      .then(([rawProds, rawStockItems]) => {
        if (cancelled) return
        const products = ensureArray<CatalogProduct>(rawProds)
        const stockItems = ensureArray<StockItem>(rawStockItems)
        const stockItemsMap = new Map(stockItems.map((item) => [item.product, item]))
        setRawProducts(products)
        setRows(products.map((p) => mapStockRow(p, stockItemsMap)))
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement stock (super-admin)', e)
        setError('Impossible de charger le stock de cette entreprise.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, selectedCompany, isGlobalMode])

  const totalStockValue = rows.filter(r => r.stock >= 0).reduce((acc, r) => acc + r.stock * r.cost, 0)
  const lowStockCount = rows.filter(r => r.stock >= 0 && r.stock <= r.minStock).length
  const outOfStockCount = rows.filter(r => r.stock === 0).length

  const openAdjustmentModal = (row: StockRow, type: 'add' | 'remove') => {
    setAdjustmentTarget({ row, type })
  }

  const applyAdjustment = async (payload: StockAdjustmentPayload) => {
    if (!selectedCompany) return
    const inventoryApi = createInventoryApi(createSuperAdminClient(selectedServer.id, selectedCompany.id))
    try {
      setIsSaving(true)
      const adjustPromise = inventoryApi.createStockMovement(payload)
      toast.promise(adjustPromise, {
        loading: "Enregistrement de l'ajustement...",
        success: 'Ajustement de stock enregistré !',
        error: 'Erreur lors de la validation.',
      })
      await adjustPromise
      setAdjustmentTarget(null)
      loadData()
    } catch (e) {
      console.error("Erreur lors de l'ajustement (super-admin)", e)
    } finally {
      setIsSaving(false)
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Sélectionnez une instance dans le menu pour voir son stock.
        </p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Sélectionnez une entreprise dans le menu pour voir son stock.
        </p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  const adjustmentProduct = adjustmentTarget
    ? rawProducts.find(p => p.id === adjustmentTarget.row.id)
    : null

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Stock — {selectedCompany.name}</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Valeur totale du stock : <span className="font-semibold text-white">{totalStockValue.toLocaleString()} FCFA</span>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Produits en stock</p>
          <p className="text-xl font-bold text-white">{rows.filter(r => r.stock >= 0).length}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Valeur du stock</p>
          <p className="text-xl font-bold text-accent-400">{totalStockValue.toLocaleString()} F</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Stock faible</p>
          <p className="text-xl font-bold text-orange-400">{lowStockCount}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Rupture</p>
          <p className="text-xl font-bold text-red-400">{outOfStockCount}</p>
        </div>
      </div>

      <StockTable products={rows} onAdjust={openAdjustmentModal} />

      {adjustmentTarget && (
        <StockAdjustmentModal
          product={{ ...adjustmentTarget.row, packagings: adjustmentProduct?.packagings }}
          type={adjustmentTarget.type}
          isSaving={isSaving}
          onSubmit={applyAdjustment}
          onClose={() => setAdjustmentTarget(null)}
        />
      )}
    </div>
  )
}
