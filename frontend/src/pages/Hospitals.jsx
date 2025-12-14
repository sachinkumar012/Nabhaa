import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  Filter,
  Navigation,
  Heart,
  Building2,
  Shield,
  PhoneCall,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Users,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  nabhaHospitals,
  hospitalCategories,
  emergencyContacts,
  nabhaAreas,
  getHospitalsByType,
  getHospitalsByArea,
  searchHospitals
} from '../data/hospitalsData';
import AnimatedCounter from '../components/UI/AnimatedCounter';

const Hospitals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Hospitals');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [showEmergency, setShowEmergency] = useState(false);

  // Filter hospitals based on search, category, and area
  const filteredHospitals = useMemo(() => {
    let hospitals = nabhaHospitals;

    // Apply search filter
    if (searchQuery.trim()) {
      hospitals = searchHospitals(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'All Hospitals') {
      hospitals = hospitals.filter(hospital => hospital.type === selectedCategory);
    }

    // Apply area filter
    if (selectedArea !== 'All Areas') {
      hospitals = hospitals.filter(hospital => hospital.area === selectedArea);
    }

    return hospitals;
  }, [searchQuery, selectedCategory, selectedArea]);

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleGetDirections = (hospital) => {
    const query = encodeURIComponent(`${hospital.name}, ${hospital.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-light" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem' }}
        >
          <h1>Healthcare Facilities in Nabha</h1>
          <p className="text-gray-600">
            Find trusted hospitals and medical centers in Nabha with comprehensive healthcare services
          </p>
        </motion.div>

        <div className="grid grid-md-2 gap-8">
          {filteredHospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="p-5">
                {/* Hospital Header */}
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="w-8 h-8" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight truncate pr-2">{hospital.name}</h3>
                      <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">
                        <CheckCircle size={10} />
                        <span>Open</span>
                      </div>
                    </div>

                    <p className="text-sm text-primary-600 font-medium mb-2">{hospital.type}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">
                        <Star size={12} className="fill-current" />
                        <span className="font-semibold">{hospital.rating}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="truncate max-w-[150px]">{hospital.area}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 24/7 Badge */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <Clock size={14} className="text-primary-500" />
                  <span className="font-medium">24/7 Emergency Services Available</span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {hospital.specialties.slice(0, 3).map((specialty, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                      {specialty}
                    </span>
                  ))}
                  {hospital.specialties.length > 3 && (
                    <span className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                      +{hospital.specialties.length - 3}
                    </span>
                  )}
                </div>

                {/* Services */}
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Services
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.services.slice(0, 4).map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[11px] font-medium border border-blue-100/50"
                      >
                        {service}
                      </span>
                    ))}
                    {hospital.services.length > 4 && (
                      <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-[11px] font-medium border border-gray-100">
                        +{hospital.services.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                {hospital.phones.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Contact
                    </h4>
                    <div className="space-y-1.5">
                      {hospital.phones.slice(0, 2).map((phone, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone size={12} className="text-gray-400" />
                          <span className="font-medium font-mono">{phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                {hospital.primaryPhone && (
                  <motion.a
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    href={`tel:${hospital.primaryPhone}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 no-underline"
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </motion.a>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleGetDirections(hospital)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Navigation size={16} />
                  <span>Map</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const message = encodeURIComponent(`Hello, I need information about ${hospital.name} in Nabha.`);
                    window.open(`https://wa.me/918264851226?text=${message}`, '_blank');
                  }}
                  className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-all shadow-sm bg-white"
                >
                  <MessageCircle size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hospitals;