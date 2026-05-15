import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Trash2, Printer, Save, Download, User as UserIcon, ClipboardList, Building2, Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const rxId = () => 'RX-' + Date.now().toString().slice(-7);

const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm text-gray-800';
const LABEL_CLS = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1';

// ── Build complete HTML for the print window ──────────────────────────────────
const buildPrintHTML = ({ prescId, doctor, patient, diagnosis, vitals, medicines, notes }) => {
  const followUpDate = () => {
    if (!patient.followUpDays) return '—';
    const d = new Date(patient.date || new Date());
    d.setDate(d.getDate() + parseInt(patient.followUpDays, 10));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const medsRows = medicines.filter(m => m.name).map((m, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px;color:#6b7280;">${i + 1}</td>
      <td style="padding:8px 10px;font-weight:600;">${m.name}</td>
      <td style="padding:8px 10px;">${m.dosage || '—'}</td>
      <td style="padding:8px 10px;">${m.frequency || '—'}</td>
      <td style="padding:8px 10px;">${m.duration || '—'}</td>
      <td style="padding:8px 10px;font-size:11px;color:#6b7280;">${m.instructions || ''}</td>
    </tr>`).join('');

  const vitalsHTML = (vitals.bp || vitals.temp || vitals.weight || vitals.spo2) ? `
    <div style="display:flex;gap:24px;margin-bottom:14px;background:#f8fafc;padding:10px 16px;border-radius:8px;border:1px solid #e2e8f0;">
      ${vitals.bp    ? `<span><b style="color:#1e3a8a;">BP:</b> ${vitals.bp} mmHg</span>` : ''}
      ${vitals.temp  ? `<span><b style="color:#1e3a8a;">Temp:</b> ${vitals.temp} °F</span>` : ''}
      ${vitals.weight? `<span><b style="color:#1e3a8a;">Weight:</b> ${vitals.weight} kg</span>` : ''}
      ${vitals.spo2  ? `<span><b style="color:#1e3a8a;">SpO2:</b> ${vitals.spo2}%</span>` : ''}
    </div>` : '';

  const notesHTML = notes ? `
    <div style="margin-bottom:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;">
      <div style="font-weight:bold;font-size:11px;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Advice / Notes</div>
      <div style="font-size:12px;font-style:italic;">${notes}</div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Prescription – ${prescId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #111; font-size: 13px; background: #fff; padding: 32px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div style="border-bottom:3px solid #1e3a8a;padding-bottom:16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-size:26px;font-weight:bold;color:#1e3a8a;">🏥 NABHAA HEALTHCARE</div>
      <div style="font-size:12px;color:#475569;margin-top:4px;">ਪੇਂਡੂ ਸਿਹਤ ਸੇਵਾਵਾਂ &bull; Rural Healthcare Excellence</div>
      <div style="margin-top:8px;font-size:12px;color:#475569;">${doctor.location || 'Primary Health Centre, Patti, Tarn Taran, Punjab – 143416'}</div>
    </div>
    <div style="text-align:right;font-size:12px;">
      <div style="font-weight:bold;font-size:15px;color:#1e3a8a;">Dr. ${doctor.name}</div>
      <div style="color:#475569;">${doctor.specialty}</div>
      <div style="color:#475569;">Reg. No: ${doctor.regNo}</div>
      <div style="color:#475569;margin-top:4px;">📞 ${doctor.phone}</div>
      <div style="color:#475569;">✉ ${doctor.email}</div>
    </div>
  </div>

  <!-- RX META -->
  <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px;color:#64748b;">
    <span>Prescription ID: <b>${prescId}</b></span>
    <span>Date: <b>${new Date(patient.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</b></span>
  </div>

  <!-- PATIENT BAR -->
  <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
    <div><div style="font-size:9px;font-weight:bold;color:#6b7280;text-transform:uppercase;">Patient Name</div><div style="font-weight:600;margin-top:2px;">${patient.name || '_______________'}</div></div>
    <div><div style="font-size:9px;font-weight:bold;color:#6b7280;text-transform:uppercase;">Age / Gender</div><div style="font-weight:600;margin-top:2px;">${patient.age || '__'} yrs / ${patient.gender || '__'}</div></div>
    <div><div style="font-size:9px;font-weight:bold;color:#6b7280;text-transform:uppercase;">Phone</div><div style="font-weight:600;margin-top:2px;">${patient.phone || '_______________'}</div></div>
    <div><div style="font-size:9px;font-weight:bold;color:#6b7280;text-transform:uppercase;">Address</div><div style="font-weight:600;margin-top:2px;">${patient.address || '_______________'}</div></div>
  </div>

  <!-- VITALS -->
  ${vitalsHTML}

  <!-- DIAGNOSIS -->
  <div style="margin-bottom:14px;">
    <div style="font-weight:bold;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;font-size:12px;text-transform:uppercase;color:#374151;">Diagnosis / Chief Complaints</div>
    <div style="padding-left:4px;">${diagnosis || 'General Consultation'}</div>
  </div>

  <!-- MEDICINES -->
  <div style="margin-bottom:16px;">
    <div style="font-weight:bold;font-size:20px;margin-bottom:8px;">℞</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="background:#1e3a8a;color:white;">
          <th style="padding:8px 10px;text-align:left;">#</th>
          <th style="padding:8px 10px;text-align:left;">Medicine Name</th>
          <th style="padding:8px 10px;text-align:left;">Dosage</th>
          <th style="padding:8px 10px;text-align:left;">Frequency</th>
          <th style="padding:8px 10px;text-align:left;">Duration</th>
          <th style="padding:8px 10px;text-align:left;">Instructions</th>
        </tr>
      </thead>
      <tbody>${medsRows || '<tr><td colspan="6" style="padding:12px;color:#9ca3af;text-align:center;">No medicines added</td></tr>'}</tbody>
    </table>
  </div>

  <!-- NOTES -->
  ${notesHTML}

  <!-- FOLLOW UP -->
  <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:10px 14px;margin-bottom:24px;">
    <span style="font-weight:bold;font-size:11px;text-transform:uppercase;color:#065f46;">📅 Follow-up Visit: </span>
    <span style="font-weight:700;color:#047857;font-size:13px;">${followUpDate()}</span>
    ${patient.followUpDays ? `<span style="color:#6b7280;font-size:11px;"> (after ${patient.followUpDays} days)</span>` : ''}
  </div>

  <!-- FOOTER / SIGNATURE -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid #e2e8f0;padding-top:20px;margin-top:20px;">
    <div style="font-size:10px;color:#9ca3af;max-width:300px;">
      * This prescription is valid for 3 days from the date of issue.<br/>
      * Please follow the dosage instructions carefully.<br/>
      * Digitally generated — Nabhaa Hospital Information System.
    </div>
    <div style="text-align:center;min-width:200px;">
      <div style="height:50px;border-bottom:1px solid #374151;margin-bottom:6px;"></div>
      <div style="font-weight:bold;font-size:13px;">Dr. ${doctor.name}</div>
      <div style="font-size:11px;color:#6b7280;">${doctor.specialty}</div>
      <div style="font-size:10px;color:#9ca3af;">Reg: ${doctor.regNo}</div>
    </div>
  </div>

</body>
</html>`;
};

// ── Main Component ─────────────────────────────────────────────────────────────
const PrescriptionWriter = () => {
  const { doctorToken } = useAuth();

  const [doctorInfo, setDoctorInfo] = useState({
    name: '', specialty: '', experience: '', location: '',
    email: '', regNo: 'PB-MCI-2024', phone: '+91 98184 XXXXX'
  });

  const [patient, setPatient] = useState({
    name: '', age: '', gender: '', date: today(),
    address: '', phone: '', followUpDays: '7'
  });

  const [diagnosis, setDiagnosis] = useState('');
  const [vitals, setVitals] = useState({ bp: '', temp: '', weight: '', spo2: '' });
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const prescId = useRef(rxId());

  // Load doctor profile
  useEffect(() => {
    if (!doctorToken) return;
    api.get('/doctors/profile', { headers: { Authorization: `Bearer ${doctorToken}` } })
      .then(r => {
        const d = r.data;
        setDoctorInfo(prev => ({
          ...prev,
          name: d.name || '', specialty: d.specialty || '',
          experience: d.experience || '', location: d.location || '', email: d.email || ''
        }));
      })
      .catch(() => {});
  }, [doctorToken]);

  const addMed = () => setMedicines(m => [...m, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeMed = i => setMedicines(m => m.filter((_, idx) => idx !== i));
  const setMed = (i, field, val) => setMedicines(m => m.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleSave = async () => {
    if (!diagnosis || medicines.some(m => !m.name)) {
      toast.warning('Fill in diagnosis and at least one medicine name.');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/doctors/prescriptions', {
        patientDetails: patient, diagnosis, medicines, notes,
        vitals, followUpDays: patient.followUpDays
      }, { headers: { Authorization: `Bearer ${doctorToken}` } });
      toast.success('Prescription saved!');
    } catch { toast.error('Failed to save prescription'); }
    finally { setIsSaving(false); }
  };

  // ── Open new window with full HTML, then print ──────────────────────────────
  const openPrintWindow = () => {
    const html = buildPrintHTML({
      prescId: prescId.current,
      doctor: doctorInfo,
      patient,
      diagnosis,
      vitals,
      medicines,
      notes
    });
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.open();
    win.document.write(html);
    win.document.close();
    // Wait for render then print
    win.onload = () => { win.focus(); win.print(); };
    // Fallback in case onload already fired
    setTimeout(() => { try { win.focus(); win.print(); } catch(e) {} }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-outfit">

      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
          <p className="text-sm text-gray-400 mt-0.5">Prescription ID: <span className="font-mono text-blue-600">{prescId.current}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
            <Save size={16} /> {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={openPrintWindow}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            <Download size={16} /> PDF
          </button>
          <button onClick={openPrintWindow}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-5">

          {/* Doctor Info */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Building2 size={18} className="text-blue-600" /> Doctor / Hospital</h3>
            <div className="space-y-3">
              {[
                { label: 'Doctor Name', key: 'name', ph: 'Dr. Harpreet Singh' },
                { label: 'Specialty', key: 'specialty', ph: 'e.g., General Physician' },
                { label: 'Registration No.', key: 'regNo', ph: 'PB-MCI-XXXX' },
                { label: 'Hospital / Clinic', key: 'location', ph: 'PHC, Tarn Taran, Punjab' },
                { label: 'Contact Phone', key: 'phone', ph: '+91 98184 XXXXX' },
              ].map(f => (
                <div key={f.key}>
                  <label className={LABEL_CLS}>{f.label}</label>
                  <input className={INPUT_CLS} value={doctorInfo[f.key]} placeholder={f.ph}
                    onChange={e => setDoctorInfo(d => ({ ...d, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><UserIcon size={18} className="text-blue-600" /> Patient Info</h3>
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Full Name</label>
                <input className={INPUT_CLS} value={patient.name} placeholder="Patient full name"
                  onChange={e => setPatient(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>Age</label>
                  <input type="number" className={INPUT_CLS} value={patient.age} placeholder="Age"
                    onChange={e => setPatient(p => ({ ...p, age: e.target.value }))} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Gender</label>
                  <select className={INPUT_CLS} value={patient.gender}
                    onChange={e => setPatient(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Date</label>
                <input type="date" className={INPUT_CLS} value={patient.date}
                  onChange={e => setPatient(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL_CLS}>Phone</label>
                <input className={INPUT_CLS} value={patient.phone} placeholder="+91 XXXXX XXXXX"
                  onChange={e => setPatient(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL_CLS}>Address</label>
                <input className={INPUT_CLS} value={patient.address} placeholder="Patient address"
                  onChange={e => setPatient(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL_CLS}>Follow-up After (days)</label>
                <input type="number" className={INPUT_CLS} value={patient.followUpDays} placeholder="7"
                  onChange={e => setPatient(p => ({ ...p, followUpDays: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Vitals</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['bp','BP (mmHg)','120/80'], ['temp','Temp (°F)','98.6'], ['weight','Weight (kg)','70'], ['spo2','SpO2 (%)','98']].map(([k,l,ph]) => (
                <div key={k}>
                  <label className={LABEL_CLS}>{l}</label>
                  <input className={INPUT_CLS} value={vitals[k]} placeholder={ph}
                    onChange={e => setVitals(v => ({ ...v, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><ClipboardList size={18} className="text-blue-600" /> Diagnosis</h3>
            <textarea rows="3" className={INPUT_CLS} placeholder="Chief complaints / diagnosis…"
              value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
            <h3 className="font-bold text-gray-800 mt-4 mb-2">Doctor's Notes</h3>
            <textarea rows="3" className={INPUT_CLS} placeholder="Advice, lifestyle changes…"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Right Column — Medicines */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Pill size={20} className="text-blue-600" /> Medicines & Dosage</h3>
              <button onClick={addMed} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                <Plus size={16} /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition">
                  <div className="col-span-12 md:col-span-3">
                    <label className={LABEL_CLS}>Medicine Name</label>
                    <input className={INPUT_CLS} placeholder="Tab. Paracetamol 500mg" value={med.name}
                      onChange={e => setMed(i, 'name', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className={LABEL_CLS}>Dosage</label>
                    <input className={INPUT_CLS} placeholder="1 Tablet" value={med.dosage}
                      onChange={e => setMed(i, 'dosage', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className={LABEL_CLS}>Frequency</label>
                    <select className={INPUT_CLS} value={med.frequency} onChange={e => setMed(i, 'frequency', e.target.value)}>
                      <option value="">Select</option>
                      <option>1-0-1</option><option>1-1-1</option><option>0-0-1</option>
                      <option>1-0-0</option><option>0-1-0</option><option>SOS</option>
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className={LABEL_CLS}>Duration</label>
                    <input className={INPUT_CLS} placeholder="5 Days" value={med.duration}
                      onChange={e => setMed(i, 'duration', e.target.value)} />
                  </div>
                  <div className="col-span-5 md:col-span-2">
                    <label className={LABEL_CLS}>Instructions</label>
                    <input className={INPUT_CLS} placeholder="After food" value={med.instructions}
                      onChange={e => setMed(i, 'instructions', e.target.value)} />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <button onClick={() => removeMed(i)} className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50 mt-4">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {medicines.length === 0 && (
                <div className="flex flex-col items-center py-16 text-gray-400">
                  <Pill size={40} className="opacity-20 mb-3" />
                  <p className="text-sm">No medicines added yet.</p>
                  <button onClick={addMed} className="text-blue-600 mt-2 text-sm hover:underline">Add first medicine</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionWriter;
