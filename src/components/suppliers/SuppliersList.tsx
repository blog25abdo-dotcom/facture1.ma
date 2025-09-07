import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import AddPaymentModal from './AddPaymentModal';
import { Plus, Search, Edit, Trash2, Phone, Mail, CreditCard, Building2, AlertTriangle } from 'lucide-react';

export default function SuppliersList() {
  const { suppliers, deleteSupplier, supplierPayments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [paymentSupplier, setPaymentSupplier] = useState<string | null>(null);

  const categories = [
    'Matières premières',
    'Fournitures de bureau',
    'Services informatiques',
    'Transport et logistique',
    'Marketing et communication',
    'Maintenance et réparation',
    'Équipements',
    'Autre'
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.ice.includes(searchTerm) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Fonction pour calculer les statistiques d'un fournisseur
  const getSupplierStats = (supplierId: string) => {
    const payments = supplierPayments.filter(payment => payment.supplierId === supplierId);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const lastPaymentDate = payments.length > 0 ? 
      new Date(Math.max(...payments.map(p => new Date(p.date).getTime()))).toLocaleDateString('fr-FR') : null;
    
    return {
      totalPaid,
      paymentsCount: payments.length,
      lastPaymentDate
    };
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      deleteSupplier(id);
    }
  };

  const handleEditSupplier = (id: string) => {
    setEditingSupplier(id);
  };

  const handleAddPayment = (id: string) => {
    setPaymentSupplier(id);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Fournisseur</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Rechercher par nom, ICE ou email..."
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                <p className="text-sm text-gray-600">Total Fournisseurs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {supplierPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">MAD Payés</p>
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
                  {suppliers.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Fournisseurs Actifs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(categories.filter(cat => suppliers.some(s => s.category === cat))).size}
                </p>
                <p className="text-sm text-gray-600">Catégories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des fournisseurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const stats = getSupplierStats(supplier.id);
            
            return (
              <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{supplier.name}</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAddPayment(supplier.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Ajouter paiement"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditSupplier(supplier.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">ICE:</span>
                    <span>{supplier.ice}</span>
                  </div>
                  {supplier.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.category && (
                    <div className="text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {supplier.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{stats.paymentsCount}</p>
                      <p className="text-xs text-gray-500">Paiements</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">MAD Payés</p>
                    </div>
                  </div>
                  
                  {stats.lastPaymentDate && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500">
                        Dernier paiement: {stats.lastPaymentDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun fournisseur trouvé</p>
          </div>
        )}

        <AddSupplierModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </div>

      {editingSupplier && (
        <EditSupplierModal
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          supplier={suppliers.find(s => s.id === editingSupplier)!}
        />
      )}

      {paymentSupplier && (
        <AddPaymentModal
          isOpen={!!paymentSupplier}
          onClose={() => setPaymentSupplier(null)}
          supplier={suppliers.find(s => s.id === paymentSupplier)!}
        />
      )}
    </>
  );
}