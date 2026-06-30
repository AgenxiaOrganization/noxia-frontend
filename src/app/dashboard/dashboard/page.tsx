'use client'

import { Layout } from '@/components/layout/Layout'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-sm text-dark-400">CA du jour</p>
          <p className="text-2xl font-bold text-accent-400">0 FCFA</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-sm text-dark-400">Ventes</p>
          <p className="text-2xl font-bold text-primary-400">0</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-sm text-dark-400">Stock</p>
          <p className="text-2xl font-bold text-orange-400">0</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-sm text-dark-400">Employés</p>
          <p className="text-2xl font-bold text-purple-400">0</p>
        </div>
      </div>
    </Layout>
  );
}