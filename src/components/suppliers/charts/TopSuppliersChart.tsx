import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Building2, Crown } from 'lucide-react';

interface SupplierData {
  name: string;
  totalPaid: number;
  paymentsCount: number;
  lastPaymentDate: string | null;
  category: string;
}

interface TopSuppliersChartProps {
  data: SupplierData[];
}

export default function TopSuppliersChart({ data }: TopSuppliersChartProps) {
  const chartData = data.map(supplier => ({
    name: supplier.name.length > 15 ? supplier.name.substring(0, 15) + '...' : supplier.name,
    fullName: supplier.name,
    amount: supplier.totalPaid,
    count: supplier.paymentsCount,
    category: supplier.category,
    lastPayment: supplier.lastPaymentDate
  }));

  const totalAmount = data.reduce((sum, supplier) => sum + supplier.totalPaid, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600">Montant: {data.amount.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Paiements: {data.count}</p>
          <p className="text-sm text-gray-600">Catégorie: {data.category}</p>
          {data.lastPayment && (
            <p className="text-sm text-gray-600">Dernier paiement: {data.lastPayment}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Fournisseurs</h3>
          <p className="text-sm text-gray-600">Classement par montant payé</p>
        </div>
        <div className="flex items-center space-x-2 text-orange-600">
          <Trophy className="w-5 h-5" />
          <span className="text-sm font-medium">Analyse</span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-lg font-bold text-orange-600">{totalAmount.toLocaleString()}</div>
          <div className="text-xs text-orange-700">MAD Total</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{data.length}</div>
          <div className="text-xs text-blue-700">Fournisseurs actifs</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">
            {data.length > 0 ? (totalAmount / data.length).toFixed(0) : '0'}
          </div>
          <div className="text-xs text-green-700">MAD Moyen</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number"
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="#6B7280"
              fontSize={11}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount"
              fill="#EA580C"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analyse des fournisseurs */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Analyse des Fournisseurs Principaux</h4>
        {data.slice(0, 3).map((supplier, index) => {
          const percentage = totalAmount > 0 ? (supplier.totalPaid / totalAmount) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index === 0 ? <Crown className="w-4 h-4" /> : `#${index + 1}`}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-xs text-gray-500">
                    {supplier.paymentsCount} paiements • {supplier.category}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {supplier.totalPaid.toLocaleString()} MAD
                </p>
                <p className="text-xs text-gray-500">
                  {percentage.toFixed(1)}% du total
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée fournisseur disponible</p>
        </div>
      )}
    </div>
  );
}