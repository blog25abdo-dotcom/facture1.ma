import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CreditCard, Banknote, FileText, Building2 } from 'lucide-react';

interface PaymentMethodData {
  name: string;
  value: number;
  count: number;
  percentage: number;
}

interface PaymentMethodDistributionProps {
  data: PaymentMethodData[];
}

export default function PaymentMethodDistribution({ data }: PaymentMethodDistributionProps) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  
  const getIcon = (name: string) => {
    switch (name) {
      case 'Virement':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'Espèces':
        return <Banknote className="w-5 h-5 text-green-600" />;
      case 'Chèque':
        return <FileText className="w-5 h-5 text-yellow-600" />;
      case 'Effet':
        return <FileText className="w-5 h-5 text-red-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600">Montant: {data.value.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Paiements: {data.count}</p>
          <p className="text-sm text-gray-600">Part: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Modes de Paiement</h3>
          <p className="text-sm text-gray-600">Répartition des paiements fournisseurs</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">MAD Total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Détails par mode */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                {getIcon(item.name)}
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.count} paiements</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {item.value.toLocaleString()} MAD
                </p>
                <p className="text-sm text-gray-600">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse des préférences */}
      <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <h4 className="font-medium text-orange-900 mb-3">💡 Analyse des Modes de Paiement</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-orange-800">
              <strong>Mode préféré:</strong> {data.length > 0 ? data[0].name : 'N/A'}
            </p>
            <p className="text-orange-700">
              {data.length > 0 ? `${data[0].percentage.toFixed(1)}% des paiements` : ''}
            </p>
          </div>
          <div>
            <p className="text-orange-800">
              <strong>Montant moyen:</strong> {totalCount > 0 ? (totalAmount / totalCount).toFixed(0) : '0'} MAD
            </p>
            <p className="text-orange-700">
              Par transaction
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun paiement enregistré</p>
        </div>
      )}
    </div>
  );
}