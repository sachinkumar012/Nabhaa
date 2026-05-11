import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileImage, Stethoscope, Calendar, Plus, Save } from "lucide-react";
import { offlineStorage } from "../services/offlineStorage";
import { syncManager } from "../services/syncManager";
import apiClient from "../services/apiClient";
import SyncStatusIndicator from "../components/UI/SyncStatusIndicator";

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({ title: '', type: 'report', diagnosis: '', notes: '' });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const response = await apiClient.get('/records');
        const data = response.data.data;
        setRecords(data);
        await offlineStorage.setItem('health_records_cache', data);
      } else {
        const cached = await offlineStorage.getItem('health_records_cache');
        if (cached) setRecords(cached);
      }
    } catch (err) {
      console.error('Failed to fetch records', err);
      const cached = await offlineStorage.getItem('health_records_cache');
      if (cached) setRecords(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    
    // Listen for sync completion to refresh
    const unsubscribe = syncManager.subscribe((status) => {
      if (status.type === 'ONLINE' && status.count === 0) {
        fetchRecords(); // Sync finished successfully, pull fresh
      }
    });
    
    return unsubscribe;
  }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const recordPayload = {
      ...newRecord,
      offlineId: `offline_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    
    // Add to local state immediately for fast feedback
    const updatedRecords = [recordPayload, ...records];
    setRecords(updatedRecords);
    setShowAddForm(false);
    setNewRecord({ title: '', type: 'report', diagnosis: '', notes: '' });

    // Enqueue to sync manager
    await syncManager.enqueue({ method: 'POST', data: recordPayload });
    
    // Cache the updated list
    await offlineStorage.setItem('health_records_cache', updatedRecords);
  };

  return (
    <div className="min-h-screen bg-light" style={{ paddingTop: "5rem", paddingBottom: "4rem" }}>
      <div className="container mx-auto px-4" style={{ maxWidth: "1100px" }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-3">
              🩺 My Health Records
            </h1>
            <p className="text-gray-600 mt-2">
              Access your medical history securely, even offline.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <SyncStatusIndicator />
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Add Record
            </button>
          </div>
        </motion.div>

        {/* Add Record Form */}
        {showAddForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleAddRecord}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8"
          >
            <h3 className="text-xl font-semibold mb-4">Add New Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required
                type="text" 
                placeholder="Title (e.g. Blood Test Result)" 
                className="p-3 border rounded-lg w-full"
                value={newRecord.title}
                onChange={e => setNewRecord({...newRecord, title: e.target.value})}
              />
              <select 
                className="p-3 border rounded-lg w-full"
                value={newRecord.type}
                onChange={e => setNewRecord({...newRecord, type: e.target.value})}
              >
                <option value="report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="xray">X-Ray / Scan</option>
                <option value="allergy">Allergy</option>
              </select>
              <input 
                type="text" 
                placeholder="Diagnosis (Optional)" 
                className="p-3 border rounded-lg w-full"
                value={newRecord.diagnosis}
                onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Notes" 
                className="p-3 border rounded-lg w-full"
                value={newRecord.notes}
                onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                <Save size={18} /> Save Record
              </button>
            </div>
          </motion.form>
        )}

        {/* Records List */}
        {loading ? (
          <div className="text-center py-10">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            No health records found. Add one to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((rec, index) => (
              <motion.div
                key={rec._id || rec.offlineId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card shadow-lg border border-gray-200 rounded-2xl p-6 bg-white flex flex-col md:flex-row justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-blue-800">{rec.title}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-xs rounded-full uppercase tracking-wider font-semibold text-gray-600">
                      {rec.type}
                    </span>
                    {rec.offlineId && !rec._id && (
                      <span className="px-2 py-1 bg-yellow-100 text-xs rounded-full text-yellow-700 font-medium">
                        Pending Sync
                      </span>
                    )}
                  </div>
                  
                  {rec.diagnosis && (
                    <p className="text-gray-700 mb-1"><strong>Diagnosis:</strong> {rec.diagnosis}</p>
                  )}
                  {rec.notes && (
                    <p className="text-gray-600 mb-1"><strong>Notes:</strong> {rec.notes}</p>
                  )}
                  {rec.doctorId?.name && (
                    <p className="flex items-center text-gray-500 text-sm mt-2">
                      <Stethoscope size={16} className="mr-2" /> Dr. {rec.doctorId.name}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end justify-between mt-4 md:mt-0">
                  <div className="flex items-center text-gray-400 text-sm mb-4 md:mb-0">
                    <Calendar size={14} className="mr-1" /> 
                    {new Date(rec.createdAt || rec.updatedAt).toLocaleDateString()}
                  </div>
                  
                  {rec.fileUrl && (
                    <a
                      href={rec.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition text-sm font-medium"
                    >
                      {rec.type === 'xray' ? <FileImage size={16} /> : <FileText size={16} />}
                      View Attachment
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}