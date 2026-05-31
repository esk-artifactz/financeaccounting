import React, { useState } from 'react';
import { Customer } from '../types';
import { saveCustomer } from '../utils/storage';
import { Upload, X, Camera } from 'lucide-react';

interface CustomerDetailProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: '',
      phone: '',
      address: '',
      photo: '',
      guarantorName: '',
      pan: '',
      aadharNumber: '',
    }
  );
  const [photoPreview, setPhotoPreview] = useState<string>(customer?.photo || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Photo size must be less than 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setFormData({ ...formData, photo: base64String });
        setErrors({ ...errors, photo: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.guarantorName?.trim()) newErrors.guarantorName = 'Guarantor name is required';
    if (!formData.pan?.trim()) newErrors.pan = 'PAN is required';
    if (!formData.aadharNumber?.trim()) newErrors.aadharNumber = 'Aadhar number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const customerData: Customer = {
      id: customer?.id || `cust_${Date.now()}`,
      name: formData.name!,
      phone: formData.phone!,
      address: formData.address!,
      photo: photoPreview,
      guarantorName: formData.guarantorName!,
      pan: formData.pan!,
      aadharNumber: formData.aadharNumber!,
      createdAt: customer?.createdAt || new Date().toISOString(),
    };

    saveCustomer(customerData);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-blue-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {customer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 mb-3 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Customer Photo"
                  className="relative w-full h-full object-cover rounded-full border-4 border-blue-100 shadow-lg"
                />
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-4 border-blue-100">
                  <Camera size={52} className="text-gray-400" />
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full cursor-pointer hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all hover:scale-110"
              >
                <Upload size={18} />
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
              {errors.photo && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">{errors.photo}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-400">•</span> {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-400">•</span> {errors.phone}
                </p>
              )}
            </div>

            {/* Guarantor Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Guarantor Name *
              </label>
              <input
                type="text"
                value={formData.guarantorName || ''}
                onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter guarantor name"
              />
              {errors.guarantorName && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-400">•</span> {errors.guarantorName}
                </p>
              )}
            </div>

            {/* PAN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PAN *
              </label>
              <input
                type="text"
                value={formData.pan || ''}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter PAN number"
              />
              {errors.pan && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-400">•</span> {errors.pan}
                </p>
              )}
            </div>

            {/* Aadhar Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhar Number *
              </label>
              <input
                type="text"
                value={formData.aadharNumber || ''}
                onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter Aadhar number"
              />
              {errors.aadharNumber && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-400">•</span> {errors.aadharNumber}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white resize-none"
                placeholder="Enter address"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-400">•</span> {errors.address}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                {customer ? 'Update' : 'Save'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDetail;
