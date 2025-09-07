import React, { useState } from 'react';
import { useData, Supplier } from '../../contexts/DataContext';
import Modal from '../common/Modal';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

export default function AddPaymentModal({ isOpen, onClose, supplier }: AddPaymentModalProps) {
  const { addSupplierPayment } = useData();
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'virement' as const,
    reference: '',
    description: '',
    invoiceNumber: '',
    category: 'purchase' as const
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      alert('Le montant doit être supérieur à 0');
      return;
    }
    
    addSupplierPayment({
      supplierId: supplier.id,
      supplier,
      amount: formData.amount,
      date: formData.date,
      method: formData.method,
      reference: formData.reference,
      description: formData.description,
      invoiceNumber: formData.invoiceNumber,
      category: formData.category
    });
    
    setFormData({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'virement',
      reference: '',
      description: '',
      invoiceNumber: '',
      category: 'purchase'
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Nouveau Paiement - ${supplier.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-orange-900 mb-2">Fournisseur sélectionné</h4>
          <p className="text-sm text-orange-800">{supplier.name}</p>
          <p className="text-xs text-orange-700">ICE: {supplier.ice}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (MAD) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de paiement *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {paymentCategories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence (optionnel)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Numéro de chèque, virement..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° Facture fournisseur (optionnel)
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="F-2024-001"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Description du paiement..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200"
          >
            Enregistrer Paiement
          </button>
        </div>
      </form>
    </Modal>
  );
}