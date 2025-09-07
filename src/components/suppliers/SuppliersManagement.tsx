import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  CreditCard, 
  BarChart3, 
  Calendar,
  Crown
} from 'lucide-react';
import SuppliersList from './SuppliersList';
import PaymentsList from './PaymentsList';
import SupplierDashboard from './SupplierDashboard';

export default function SuppliersManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 mb-6">
            La Gestion des Fournisseurs est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'suppliers', label: 'Fournisseurs', icon: Building2 },
    { id: 'payments', label: 'Paiements', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-orange-600" />
            <span>Gestion des Fournisseurs</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Module complet de gestion des fournisseurs avec suivi des paiements et analyses. 
            Fonctionnalité réservée aux abonnés PRO.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <SupplierDashboard />}
        {activeTab === 'suppliers' && <SuppliersList />}
        {activeTab === 'payments' && <PaymentsList />}
      </div>
    </div>
  );
}