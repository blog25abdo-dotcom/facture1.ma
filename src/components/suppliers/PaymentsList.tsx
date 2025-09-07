import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Search, Filter, Download, Trash2, CreditCard, Calendar, Building2 } from 'lucide-react';

export default function PaymentsList() {
  const { supplierPayments, suppliers, deleteSupplierPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const paymentMethods = [
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'espece', label: 'Espèces' },
    { value: 'effet', label: 'Effet de commerce' }
  ];

  const paymentCategories = [
    { value: 'purchase', label: 'Achat de marchandises' },
    { value: 'service', label: 'Prestation de service' },
    { value: 'equipment', label: 'Équipement' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Autre' }
  ];

  const getFilteredPayments = () => {
    return supplierPayments.filter(payment => {
      const matchesSearch = payment.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      const matchesCategory = categoryFilter === 'all' || payment.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const paymentDate = new Date(payment.date);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = paymentDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = paymentDate >= weekAgo;
            break;
          case 'month':
            matchesDate = paymentDate.getMonth() === now.getMonth() && 
                         paymentDate.getFullYear() === now.getFullYear();
            break;
          case 'year':
            matchesDate = paymentDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return matchesSearch && matchesMethod && matchesCategory && matchesDate;
    });
  };

  const filteredPayments = getFilteredPayments();
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'virement':
        return '🏦';
      case 'cheque':
        return '📄';
      case 'espece':
        return '💵';
      case 'effet':
        return '📋';
      default:
        return '💳';
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = paymentCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getMethodLabel = (method: string) => {
    const m = paymentMethods.find(m => m.value === method);
    return m ? m.label : method;
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      deleteSupplierPayment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des Paiements</h1>
          <p className="text-gray-600">Suivi de tous les paiements effectués aux fournisseurs</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{totalAmount.toLocaleString()} MAD</div>
          <div className="text-sm text-gray-600">Total période sélectionnée</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Rechercher..."
            />
          </div>
          
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les modes</option>
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Toutes les catégories</option>
            {paymentCategories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              <p className="text-sm text-gray-600">Paiements</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredPayments.map(p => p.supplierId)).size}
              </p>
              <p className="text-sm text-gray-600">Fournisseurs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredPayments.length > 0 ? (totalAmount / filteredPayments.length).toFixed(0) : '0'}
              </p>
              <p className="text-sm text-gray-600">MAD Moyen</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {supplierPayments.length > 0 ? ((filteredPayments.length / supplierPayments.length) * 100).toFixed(0) : '0'}
              </p>
              <p className="text-sm text-gray-600">% du Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.supplier.name}</div>
                      {payment.invoiceNumber && (
                        <div className="text-xs text-gray-500">Facture: {payment.invoiceNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 text-sm">
                      <span>{getMethodIcon(payment.method)}</span>
                      <span>{getMethodLabel(payment.method)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryLabel(payment.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.reference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun paiement trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}