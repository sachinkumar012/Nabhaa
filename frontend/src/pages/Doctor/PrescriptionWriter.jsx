import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Trash2, Printer, Save, User as UserIcon, Calendar, ClipboardList } from 'lucide-react';

const PrescriptionWriter = ({ appointmentId, patientInfo }) => {
    const [patient, setPatient] = useState(patientInfo || { name: '', age: '', gender: '', email: '' });
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedicine = (index) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleSave = async () => {
        if (!diagnosis || medicines.some(m => !m.name)) {
            toast.warning('Please fill in diagnosis and at least one medicine name.');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('doctorToken');
            const { data } = await api.post('/doctors/prescriptions', {
                appointmentId,
                patientDetails: patient,
                diagnosis,
                medicines,
                notes
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success('Prescription saved successfully!');
            // After saving, we could offer to print
        } catch (error) {
            toast.error('Failed to save prescription');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header Area */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">New Prescription</h1>
                    <p className="text-gray-500 italic">Creating for: {patient.name || 'Walk-in Patient'}</p>
                </div>
                <div className="flex gap-3 no-print">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} /> {isSaving ? 'Saving...' : 'Save Final'}
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl hover:bg-gray-900 transition-colors"
                    >
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Patient & Diagnosis */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <UserIcon size={20} className="text-blue-600" /> Patient Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white transition-colors" 
                                    value={patient.name}
                                    onChange={(e) => setPatient({...patient, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <input 
                                        type="number" 
                                        className="w-full border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white" 
                                        value={patient.age}
                                        onChange={(e) => setPatient({...patient, age: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select 
                                        className="w-full border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white"
                                        value={patient.gender}
                                        onChange={(e) => setPatient({...patient, gender: e.target.value})}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ClipboardList size={20} className="text-blue-600" /> Diagnosis
                        </h3>
                        <textarea 
                            rows="4"
                            placeholder="Enter diagnosis or chief complaints..."
                            className="w-full border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white transition-colors"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        ></textarea>
                        
                        <h3 className="text-lg font-bold mt-6 mb-4">Doctor's Notes</h3>
                        <textarea 
                            rows="4"
                            placeholder="Advice, lifestyle changes, etc..."
                            className="w-full border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white transition-colors"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* Right Column: Medicines Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Medicines & Dosage</h3>
                            <button 
                                onClick={addMedicine}
                                className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                            >
                                <Plus size={20} /> Add Medicine
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-100 pb-4">
                                    <tr>
                                        <th className="font-semibold text-gray-600 py-3 w-2/5">Medicine Name</th>
                                        <th className="font-semibold text-gray-600 py-3">Dosage</th>
                                        <th className="font-semibold text-gray-600 py-3">Frequency</th>
                                        <th className="font-semibold text-gray-600 py-3">Duration</th>
                                        <th className="font-semibold text-gray-600 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {medicines.map((med, index) => (
                                        <tr key={index} className="group">
                                            <td className="py-4 pr-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Tab. Calpol 500mg" 
                                                    className="w-full border-none focus:ring-0 bg-transparent text-gray-800 font-medium p-0"
                                                    value={med.name}
                                                    onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Special instructions (e.g. after food)" 
                                                    className="w-full border-none focus:ring-0 bg-transparent text-gray-500 text-sm mt-1 p-0"
                                                    value={med.instructions}
                                                    onChange={(e) => handleMedChange(index, 'instructions', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="1/2 Tablet" 
                                                    className="w-full border-none focus:ring-0 bg-transparent text-gray-700 p-0"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-4">
                                                <select 
                                                    className="w-full border-none focus:ring-0 bg-transparent text-gray-700 p-0 cursor-pointer"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="1-0-1">1-0-1</option>
                                                    <option value="1-1-1">1-1-1</option>
                                                    <option value="0-0-1">0-0-1</option>
                                                    <option value="1-0-0">1-0-0</option>
                                                    <option value="SOS">SOS (When needed)</option>
                                                </select>
                                            </td>
                                            <td className="py-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="5 Days" 
                                                    className="w-full border-none focus:ring-0 bg-transparent text-gray-700 p-0"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-4 text-right">
                                                <button 
                                                    onClick={() => removeMedicine(index)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {medicines.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <ClipboardList size={48} className="opacity-20 mb-4" />
                                <p>No medicines added yet.</p>
                                <button onClick={addMedicine} className="text-blue-600 mt-2 hover:underline">Add first medicine</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Print Template */}
            <PrintTemplate 
                patient={patient} 
                diagnosis={diagnosis} 
                medicines={medicines} 
                notes={notes} 
            />
        </div>
    );
};

const PrintTemplate = ({ patient, diagnosis, medicines, notes }) => {
    return (
        <div className="print-only hidden p-12 bg-white text-black font-serif" id="print-area">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-blue-700">NABHA HOSPITAL</h1>
                    <p className="text-sm">Real-time Healthcare Excellence</p>
                    <p className="mt-2 text-gray-600">SCF 12, Main Market, Sector 17,<br/>Chandigarh, 160017</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">Contact: +91 98765 43210</p>
                    <p>Email: appointments@nabha.com</p>
                    <p>Web: www.nabhahospital.com</p>
                </div>
            </div>

            {/* Patient Info Bar */}
            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 border rounded mb-8">
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Patient Name</p>
                    <p className="font-semibold">{patient.name || '________________'}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Age / Gender</p>
                    <p className="font-semibold">{patient.age || '__'} / {patient.gender || '__'}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Date</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Consultation ID</p>
                    <p className="font-semibold">PR-{Date.now().toString().slice(-6)}</p>
                </div>
            </div>

            {/* Diagnosis */}
            <div className="mb-8">
                <h3 className="font-bold border-b mb-2">DIAGNOSIS</h3>
                <p className="whitespace-pre-wrap">{diagnosis || 'General Checkup'}</p>
            </div>

            {/* Medicines */}
            <div className="mb-8">
                <h3 className="font-bold mb-4 text-xl">R<span className="text-sm self-start">x</span></h3>
                <table className="w-full border-collapse">
                    <thead className="border-b-2">
                        <tr>
                            <th className="text-left font-bold py-2">Medicine (Salt)</th>
                            <th className="text-left font-bold py-2">Dosage</th>
                            <th className="text-left font-bold py-2">Frequency</th>
                            <th className="text-left font-bold py-2">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {medicines.map((med, i) => (
                            <tr key={i}>
                                <td className="py-3">
                                    <p className="font-bold">{med.name}</p>
                                    <p className="text-sm">{med.instructions}</p>
                                </td>
                                <td className="py-3">{med.dosage}</td>
                                <td className="py-3">{med.frequency}</td>
                                <td className="py-3">{med.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notes */}
            {notes && (
                <div className="mb-12">
                    <h3 className="font-bold border-b mb-2 uppercase text-sm">Advice / Notes</h3>
                    <p className="whitespace-pre-wrap text-sm italic">{notes}</p>
                </div>
            )}

            {/* Footer / Sign */}
            <div className="mt-20 flex justify-between items-end pt-12">
                <div className="text-xs text-gray-400">
                    * Valid for 3 days from the date of issue. <br/>
                    * Please follow the dosage carefully.
                </div>
                <div className="text-center border-t border-black pt-2 px-8 min-w-[200px]">
                    <p className="font-bold">Consultant Signature</p>
                    <p className="text-xs uppercase">Reg No: NABHA-DR-2024</p>
                </div>
            </div>
            
            <div className="fixed bottom-8 left-12 right-12 text-center text-[10px] text-gray-300 border-t pt-2">
                This is a digitally generated prescription from Nabha Hospital Information System.
            </div>
        </div>
    );
}

// Add CSS for print-only
const style = document.createElement('style');
style.innerHTML = `
    @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        aside { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
    }
`;
document.head.appendChild(style);

export default PrescriptionWriter;
