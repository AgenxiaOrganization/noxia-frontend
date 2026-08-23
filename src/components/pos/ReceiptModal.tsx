'use client'

import { useRef } from 'react'
import { Sale } from '../../lib/api/sales'
import { X, Printer, Receipt, CheckCircle, Store, User, Clock, Wallet } from 'lucide-react'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  companyName?: string
}

export default function ReceiptModal({
  isOpen,
  onClose,
  sale,
  companyName = 'NOXIA Establishment'
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !sale) return null

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    if (!windowPrint) return

    windowPrint.document.write(`
      <html>
        <head>
          <title>Reçu Vente #${sale.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 20px; color: #000; width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
            .info { margin-bottom: 10px; font-size: 11px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .table th { border-bottom: 1px solid #000; text-align: left; padding: 4px 0; }
            .table td { padding: 4px 0; }
            .text-right { text-align: right; }
            .total { border-top: 1px dashed #000; font-weight: bold; font-size: 14px; padding-top: 8px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyName}</h2>
            <p>REÇU D'ENCAISSEMENT</p>
            <p>N° #${sale.id}</p>
          </div>
          <div class="info">
            <p>Date : ${sale.created_at ? new Date(sale.created_at).toLocaleString('fr-FR') : ''}</p>
            <p>Caissier : ${sale.cashier_name || 'Caissier'}</p>
            <p>Mode : ${sale.payment_method === 'cash' ? 'Espèces' : sale.payment_method === 'mobile_money' ? 'Mobile Money' : 'Carte'}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Art.</th>
                <th class="text-right">Qté</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(sale.items || []).map(item => {
                const lineTotal = item.subtotal ? parseFloat(item.subtotal) : parseFloat(item.unit_price) * parseFloat(item.quantity)
                return `
                <tr>
                  <td>${item.product_name || 'Produit'}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${lineTotal.toLocaleString('fr-FR')} F</td>
                </tr>
              `
              }).join('')}
            </tbody>
          </table>
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL PAYÉ :</span>
              <span>${(parseFloat(sale.total_amount) || 0).toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <div class="footer">
            <p>Merci pour votre visite !</p>
            <p>Plateforme Noxia SaaS</p>
          </div>
        </body>
      </html>
    `)

    windowPrint.document.close()
    windowPrint.focus()
    setTimeout(() => {
      windowPrint.print()
      windowPrint.close()
    }, 250)
  }

  const dateFormatted = sale.created_at 
    ? new Date(sale.created_at).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'Récemment'

  const totalNum = parseFloat(sale.total_amount) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-dark-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/60">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Reçu d'encaissement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du Reçu */}
        <div className="p-6 overflow-y-auto space-y-6" ref={printRef}>
          {/* Status Ticket Success */}
          <div className="flex flex-col items-center justify-center text-center space-y-2 pb-4 border-b border-dark-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-white">{totalNum.toLocaleString('fr-FR')} FCFA</h4>
            <p className="text-xs text-emerald-400 font-medium">Vente encaissée avec succès</p>
          </div>

          {/* Informations Clés */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-dark-950 border border-dark-800/80 space-y-1">
              <span className="text-dark-400 font-medium flex items-center gap-1">
                <Store className="w-3 h-3 text-indigo-400" />
                Vente N°
              </span>
              <p className="font-bold text-white">#{sale.id}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-dark-950 border border-dark-800/80 space-y-1">
              <span className="text-dark-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                Date & Heure
              </span>
              <p className="font-bold text-white">{dateFormatted}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-dark-950 border border-dark-800/80 space-y-1">
              <span className="text-dark-400 font-medium flex items-center gap-1">
                <User className="w-3 h-3 text-indigo-400" />
                Caissier
              </span>
              <p className="font-bold text-white truncate">{sale.cashier_name || 'Caissier'}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-dark-950 border border-dark-800/80 space-y-1">
              <span className="text-dark-400 font-medium flex items-center gap-1">
                <Wallet className="w-3 h-3 text-indigo-400" />
                Paiement
              </span>
              <p className="font-bold text-white">
                {sale.payment_method === 'cash' ? 'Espèces' : sale.payment_method === 'mobile_money' ? 'Mobile Money' : 'Carte'}
              </p>
            </div>
          </div>

          {/* Détails des Articles */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Détail des articles</span>
            <div className="rounded-xl border border-dark-800 bg-dark-950/60 divide-y divide-dark-800/60">
              {(sale.items || []).map((item, idx) => {
                const q = parseFloat(item.quantity || '1')
                const p = parseFloat(item.unit_price || '0')
                const sub = item.subtotal ? parseFloat(item.subtotal) : q * p

                return (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-white">{item.product_name || 'Produit'}</p>
                      <p className="text-dark-400">{q} x {p.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <span className="font-bold text-emerald-400">{sub.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dark-800 bg-dark-950/60 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-dark-700 bg-dark-800 hover:bg-dark-700 text-xs font-medium text-white transition cursor-pointer"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  )
}
