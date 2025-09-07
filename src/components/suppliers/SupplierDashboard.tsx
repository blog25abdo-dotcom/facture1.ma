import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  Users,
  CreditCard,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import TopSuppliersChart from './charts/TopSuppliersChart';
import PaymentEvolutionChart from './charts/PaymentEvolutionChart';
import PaymentMethodDistribution from './charts/PaymentMethodDistribution';
import html2pdf from 'html2pdf.js';

export default function SupplierDashboard() {
  const { suppliers, supplierPayments } = useData();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

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

  // Calculs des statistiques
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const getFilteredPayments = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return supplierPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      const matchesPeriod = paymentDate >= startDate;
      const matchesSupplier = selectedSupplier === 'all' || payment.supplierId === selectedSupplier;
      return matchesPeriod && matchesSupplier;
    });
  };

  const filteredPayments = getFilteredPayments();
  const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const uniqueSuppliers = new Set(filteredPayments.map(p => p.supplierId)).size;
  const averagePayment = filteredPayments.length > 0 ? totalPaid / filteredPayments.length : 0;

  // Données pour les graphiques
  const paymentEvolutionData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthPayments = supplierPayments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });
      
      const totalAmount = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentsCount = monthPayments.length;
      
      months.push({
        month: format(date, 'MMM', { locale: fr }),
        amount: totalAmount,
        count: paymentsCount,
        date: date.toISOString()
      });
    }
    
    return months;
  }, [supplierPayments]);

  const topSuppliersData = useMemo(() => {
    const supplierStats = suppliers.map(supplier => {
      const supplierPayments = filteredPayments.filter(payment => payment.supplierId === supplier.id);
      const totalPaid = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentsCount = supplierPayments.length;
      const lastPaymentDate = supplierPayments.length > 0 ? 
        new Date(Math.max(...supplierPayments.map(p => new Date(p.date).getTime()))).toLocaleDateString('fr-FR') : null;
      
      return {
        name: supplier.name,
        totalPaid,
        paymentsCount,
        lastPaymentDate,
        category: supplier.category
      };
    }).filter(supplier => supplier.totalPaid > 0)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10);
    
    return supplierStats;
  }, [suppliers, filteredPayments]);

  const paymentMethodData = useMemo(() => {
    const methods = ['virement', 'cheque', 'espece', 'effet'];
    const methodStats = methods.map(method => {
      const methodPayments = filteredPayments.filter(payment => payment.method === method);
      const amount = methodPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        name: method === 'virement' ? 'Virement' : 
              method === 'cheque' ? 'Chèque' :
              method === 'espece' ? 'Espèces' : 'Effet',
        value: amount,
        count: methodPayments.length,
        percentage: totalPaid > 0 ? (amount / totalPaid) * 100 : 0
      };
    }).filter(method => method.value > 0);
    
    return methodStats;
  }, [filteredPayments, totalPaid]);

  const handleExportPDF = () => {
    const reportContent = generateSupplierReportHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = reportContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Rapport_Fournisseurs_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateSupplierReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #EA580C; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #EA580C; margin: 0; font-weight: bold;">RAPPORT FOURNISSEURS</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${user?.company?.name || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques Globales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Total Fournisseurs:</strong> ${suppliers.length}</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Total Payé:</strong> ${totalPaid.toLocaleString()} MAD</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">🏆 Top 5 Fournisseurs</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Fournisseur</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Montant Payé</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Nb Paiements</th>
              </tr>
            </thead>
            <tbody>
              ${topSuppliersData.slice(0, 5).map(supplier => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${supplier.name}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${supplier.totalPaid.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${supplier.paymentsCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-orange-600" />
            <span>Tableau de Bord Fournisseurs</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Analyse complète de vos relations fournisseurs et paiements. Fonctionnalité réservée aux abonnés PRO.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période d'analyse
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fournisseur
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous les fournisseurs</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 mt-6"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              <p className="text-sm text-gray-600">Fournisseurs Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPaid.toLocaleString()}</p>
              <p className="text-sm text-gray-600">MAD Payés (période)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              <p className="text-sm text-gray-600">Paiements (période)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{averagePayment.toFixed(0)}</p>
              <p className="text-sm text-gray-600">MAD Moyen/Paiement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentEvolutionChart data={paymentEvolutionData} />
        <PaymentMethodDistribution data={paymentMethodData} />
      </div>

      <TopSuppliersChart data={topSuppliersData} />

      {/* Alertes et recommandations */}
      {suppliers.length > 0 && (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Recommandations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">💡 Optimisation des paiements :</p>
              <ul className="space-y-1 opacity-90">
                <li>• Négociez des délais de paiement plus longs</li>
                <li>• Groupez les paiements pour réduire les frais</li>
                <li>• Surveillez les échéances pour éviter les pénalités</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">📊 Analyse des données :</p>
              <ul className="space-y-1 opacity-90">
                <li>• Identifiez vos fournisseurs stratégiques</li>
                <li>• Analysez les tendances de dépenses</li>
                <li>• Optimisez votre trésorerie</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}