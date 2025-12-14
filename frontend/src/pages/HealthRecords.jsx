import  { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileImage, Stethoscope, Calendar } from "lucide-react";

export default function HealthRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        date: "2025-09-10",
        doctor: "Dr. Ramesh",
        diagnosis: "Fever & Cold",
        prescription: ["Paracetamol 500mg - 2/day", "Vitamin C - 1/day"],
        notes: "Drink more water and rest",
        type: "pdf",
        file: "/prescription_sample.pdf", // must exist in public/records
      },
      {
        id: 2,
        date: "2025-09-05",
        doctor: "Dr. Priya",
        diagnosis: "Migraine",
        prescription: ["Ibuprofen 200mg", "Electrolyte hydration"],
        notes: "Avoid screen time",
        type: "pdf",
        file: "/records/blood_test_sample.pdf",
      },
      {
        id: 3,
        date: "2025-08-28",
        doctor: "Dr. Arjun",
        diagnosis: "Fracture – Left Arm",
        prescription: ["Painkillers", "Calcium supplements", "Physiotherapy"],
        notes: "Follow up in 2 weeks",
        type: "image",
        file: "/records/xray_fracture.png",
      },
    ];
    setRecords(dummyData);
  }, []);

  return (
    <div className="min-h-screen bg-light" style={{ paddingTop: "5rem", paddingBottom: "4rem" }}>
      <div className="container" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-blue-700">🩺 My Health Records</h1>
          <p className="text-gray-600 mt-2">
            Access prescriptions, test reports, and X-rays anytime
          </p>
        </motion.div>

        {/* Records */}
        <div className="space-y-6">
          {records.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card shadow-lg border border-gray-200 rounded-2xl p-6 bg-white"
            >
              {/* Top Info */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-800">{rec.diagnosis}</h3>
                  <p className="flex items-center text-gray-600">
                    <Stethoscope size={16} className="mr-2" /> {rec.doctor}
                  </p>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar size={16} className="mr-2" /> {rec.date}
                </div>
              </div>

              {/* Prescription */}
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Prescription</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {Array.isArray(rec.prescription) ? (
                    rec.prescription.map((med, i) => <li key={i}>{med}</li>)
                  ) : (
                    <li>{rec.prescription}</li>
                  )}
                </ul>
              </div>

              {/* Notes */}
              <div className="mb-4 text-gray-600">
                <strong>Notes: </strong> {rec.notes}
              </div>

              {/* File */}
              <div className="flex justify-end">
                {rec.type === "pdf" ? (
                  <a
                    href={rec.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <FileText size={18} /> Open PDF
                  </a>
                ) : (
                  <a
                    href={rec.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                  >
                    <FileImage size={18} /> View X-ray
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}