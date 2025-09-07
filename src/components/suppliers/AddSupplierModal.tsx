import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLicense } from '../../contexts/LicenseContext';
import Modal from '../common/Modal';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSupplierModal({ isOpen, onClose }: AddSupplierModalProps) {
  const { addSupplier } = useData();
  const { checkLimit } = useLicense();
  const [formData, setFormData] = useState({
    name: '',
    ice: '',
    rc: '',
    if: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    paymentTerms: 30,
    category: '',
    status: 'active' as const
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkLimit('suppliers')) {
      alert('🚨 Vous avez atteint la limite de fournisseurs de la version gratuite. Passez à la version Pro pour continuer.');
      return;
    }
    
    if (!formData.name || !formData.ice) {
      alert('Le nom et l\'ICE sont obligatoires');
      return;
    }
    
    addSupplier(formData);
    setFormData({
      name: '',
      ice: '',
      rc: '',
      if: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      contactPerson: '',
      paymentTerms: 30,
      category: '',
      status: 'active'
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
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Fournisseur" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison sociale *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nom du fournisseur"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ICE *
            </label>
            <input
              type="text"
              name="ice"
              value={formData.ice}
              onChange={handleChange}
              required
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="001234567000012"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RC (Registre de Commerce)
            </label>
            <input
              type="text"
              name="rc"
              value={formData.rc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="98765"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IF (Identifiant Fiscal)
            </label>
            <input
              type="text"
              name="if"
              value={formData.if}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="12345678"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="+212 522 123 456"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="contact@fournisseur.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://www.fournisseur.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personne de contact
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nom du contact principal"
            />
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
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Délai de paiement (jours)
            </label>
            <input
              type="number"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="30"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Adresse complète du fournisseur"
            />
          </div>
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
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-200"
          >
            Ajouter Fournisseur
          </button>
        </div>
      </form>
    </Modal>
  );
}