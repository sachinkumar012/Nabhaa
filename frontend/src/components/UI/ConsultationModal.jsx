import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../services/apiClient';

export default function ConsultationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', mobile: '', city: '', problem: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/public/consultation', formData);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ name: '', mobile: '', city: '', problem: '' });
        }, 3000);
      } else {
        setError(response.data.message || 'Submission failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden w-full max-w-[380px] animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-200 z-10"
        >
          <X size={20} />
        </button>
        <div className="bg-[#E51C23] text-white text-center py-3 font-bold text-[15px] tracking-wide relative">
           Get Started
        </div>
        
        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Request Sent!</h3>
            <p className="text-gray-600 text-sm">Our medical team will contact you shortly.</p>
          </div>
        ) : (
          <form className="p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
            <input 
              type="text" 
              placeholder="Name*" 
              required 
              className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm bg-white" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <div className="flex gap-4">
              <input 
                type="tel" 
                placeholder="Mobile*" 
                required 
                className="w-1/2 px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm bg-white" 
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="City*" 
                required 
                className="w-1/2 px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm bg-white" 
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <textarea 
              placeholder="Discuss Your Problem*" 
              required 
              rows={3} 
              className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm resize-none bg-white"
              value={formData.problem}
              onChange={e => setFormData({...formData, problem: e.target.value})}
            ></textarea>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#1D70B8] hover:bg-[#155fc2] disabled:opacity-70 transition-colors text-white font-bold py-3.5 rounded-full mt-2 w-full shadow-md flex items-center justify-center gap-2"
            >
              {loading ? 'SENDING...' : 'SUBMIT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
