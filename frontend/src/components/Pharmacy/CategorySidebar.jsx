import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'all',
    label: 'All Medicines',
    icon: '🏥',
    keywords: [],
    subcats: [],
  },
  {
    id: 'personal-care',
    label: 'Personal Care',
    icon: '🧴',
    keywords: ['cream', 'lotion', 'soap', 'shampoo', 'skin', 'hair', 'oral', 'dental'],
    subcats: ['Skin Care', 'Hair Care', 'Oral Care', 'Baby Care', 'Elderly Care'],
  },
  {
    id: 'vitamins',
    label: 'Vitamins & Supplements',
    icon: '💪',
    keywords: ['vitamin', 'supplement', 'calcium', 'iron', 'zinc', 'omega', 'protein', 'multivitamin'],
    subcats: ['Multivitamins', 'Omega-3', 'Calcium', 'Iron', 'Zinc'],
  },
  {
    id: 'diabetes',
    label: 'Diabetes Care',
    icon: '🩸',
    keywords: ['diabetes', 'insulin', 'glucose', 'metformin', 'gluco', 'diabetic'],
    subcats: ['Glucometers', 'Test Strips', 'Insulin', 'Oral Diabetics'],
  },
  {
    id: 'devices',
    label: 'Healthcare Devices',
    icon: '🩺',
    keywords: ['thermometer', 'bp monitor', 'nebulizer', 'pulse', 'monitor', 'device'],
    subcats: ['BP Monitors', 'Thermometers', 'Nebulizers', 'Glucometers'],
  },
  {
    id: 'baby',
    label: 'Baby & Mom',
    icon: '👶',
    keywords: ['baby', 'infant', 'pediatric', 'child', 'mother', 'prenatal'],
    subcats: ['Baby Skin', 'Baby Food', 'Diapers', 'Prenatal'],
  },
  {
    id: 'homeopathic',
    label: 'Homeopathic',
    icon: '🌿',
    keywords: ['homeo', 'homeopathic', 'ayurvedic', 'herbal', 'natural'],
    subcats: ['Drops', 'Tablets', 'Ointments', 'Tonics'],
  },
  {
    id: 'pain',
    label: 'Pain & Fever',
    icon: '🌡️',
    keywords: ['pain', 'fever', 'paracetamol', 'ibuprofen', 'analgesic', 'anti-inflammatory'],
    subcats: ['Analgesics', 'Antipyretics', 'Muscle Relaxants', 'Topical Gels'],
  },
  {
    id: 'antibiotics',
    label: 'Antibiotics',
    icon: '💊',
    keywords: ['antibiotic', 'amoxicillin', 'azithromycin', 'ciprofloxacin', 'infection', 'bacterial'],
    subcats: ['Broad Spectrum', 'Fluoroquinolones', 'Macrolides', 'Penicillin'],
  },
  {
    id: 'stomach',
    label: 'Stomach & Digestion',
    icon: '🫃',
    keywords: ['antacid', 'digestion', 'omeprazole', 'pantoprazole', 'stomach', 'gastric', 'laxative'],
    subcats: ['Antacids', 'Probiotics', 'Laxatives', 'Anti-nausea'],
  },
];

const CategorySidebar = ({ activeCategory, onCategoryChange, activeSubcat, onSubcatChange }) => {
  const [openCat, setOpenCat] = useState(activeCategory || 'all');

  const handleCatClick = (cat) => {
    setOpenCat(cat.id);
    onCategoryChange(cat.id);
    onSubcatChange?.('');
  };

  const currentCat = CATEGORIES.find(c => c.id === openCat);

  return (
    <div className="w-56 shrink-0 hidden lg:block">
      {/* Sidebar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3">
          <p className="text-white font-bold text-sm tracking-wide">Categories</p>
        </div>
        <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-200">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCatClick(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all text-sm font-medium group
                ${activeCategory === cat.id || (cat.id === 'all' && !activeCategory)
                  ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600 border-r-4 border-transparent'
                }`}
            >
              <span className="text-lg shrink-0">{cat.icon}</span>
              <span className="truncate leading-tight">{cat.label}</span>
              {cat.subcats.length > 0 && (
                <ChevronRight size={14} className="ml-auto opacity-40 shrink-0 group-hover:opacity-70" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Panel */}
      {currentCat && currentCat.subcats.length > 0 && (
        <div className="mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{currentCat.label}</p>
          </div>
          <div className="p-2">
            {currentCat.subcats.map((sub) => (
              <button
                key={sub}
                onClick={() => onSubcatChange?.(sub === activeSubcat ? '' : sub)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${activeSubcat === sub
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySidebar;
