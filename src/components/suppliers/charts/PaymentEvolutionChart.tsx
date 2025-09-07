import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface PaymentEvolutionData {
  month: string;
  amount: number;
  count: number;
  date: string;
}

interface PaymentEvolutionChartProps {
  data: PaymentEvolutionData[];
}

export default function PaymentEvolutionChart({ data }: PaymentEvolutionChartProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const averageMonthly = data.length > 0 ? totalAmount / data.length : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600">Montant: {data.amount.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Paiements: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Évolution des Paiements</h3>
          <p className="text-sm text-gray-600">Montants payés par mois (12 derniers mois)</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Tendance</span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">{totalAmount.toLocaleString()}</div>
          <div className="text-xs text-green-700">MAD Total (12 mois)</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{totalCount}</div>
          <div className="text-xs text-blue-700">Paiements Total</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-600">{averageMonthly.toFixed(0)}</div>
          <div className="text-xs text-purple-700">MAD Moyen/Mois</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month"
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#EA580C"
              strokeWidth={3}
              dot={{ fill: '#EA580C', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EA580C', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée de paiement disponible</p>
        </div>
      )}
    </div>
  );
}