// Hospital data for Nabha, Punjab
export const nabhaHospitals = [
  {
    id: 1,
    name: "Sawhney Hospital & Maternity Home",
    type: "Multi-specialty",
    specialties: ["Maternity", "General Medicine", "Pediatrics"],
    address:
      "Ripudaman Pura, Nabha, Patiala Gate, Near Gurudwara Akalgarh, Munshian St, Nabha - 147201",
    landmark: "Near Gurudwara Akalgarh, inside Patiala Gate Nabha",
    phones: ["+91-1765-229611"],
    primaryPhone: "+91-1765-229611",
    area: "Patiala Gate",
    verified: true,
    rating: 4.2,
    services: ["24x7 Emergency", "Maternity Care", "General OPD", "Laboratory"],
    coordinates: { lat: 30.3753, lng: 76.1539 },
  },
  {
    id: 2,
    name: "Goyal Healthcare Hospital",
    type: "General Hospital",
    specialties: ["General Medicine", "Surgery", "Orthopedics"],
    address:
      "College Road, Hira Mahal Colony, Nabha - 147201 (Opposite College Ground)",
    landmark: "Opposite College Ground, Hira Mahal Colony",
    phones: ["+91-1765-220001", "+91-1765-220002"],
    primaryPhone: "+91-1765-220001",
    area: "Hira Mahal Colony",
    verified: true,
    rating: 4.0,
    services: ["General OPD", "Surgery", "Emergency Care"],
    coordinates: { lat: 30.3743, lng: 76.1549 },
  },
  {
    id: 3,
    name: "Bansal Hospital & Laparoscopic Centre",
    type: "Surgical Hospital",
    specialties: [
      "Laparoscopic Surgery",
      "General Surgery",
      "Gastroenterology",
    ],
    address: "Hira Mahal Colony, Circular Road, Nabha - 147201",
    landmark: "Circular Road, Hira Mahal Colony",
    phones: ["01765-226301"],
    primaryPhone: "01765-226301",
    area: "Circular Road",
    verified: true,
    rating: 4.3,
    services: ["Laparoscopic Surgery", "General Surgery", "Endoscopy", "OPD"],
    coordinates: { lat: 30.374, lng: 76.1545 },
  },
  {
    id: 4,
    name: "Veenu Goyal Hospital",
    type: "General Hospital",
    specialties: ["General Medicine", "Pediatrics", "Gynecology"],
    address: "Modi Mill Colony, Bouran Gate, Nabha - 147201 (Near SBI)",
    landmark: "Near SBI, Bouran Gate",
    phones: ["+91-1765-221001", "+91-1765-221002"],
    primaryPhone: "+91-1765-221001",
    area: "Bouran Gate",
    verified: true,
    rating: 3.8,
    services: ["General OPD", "Emergency", "Women's Health"],
    coordinates: { lat: 30.376, lng: 76.153 },
  },
  {
    id: 5,
    name: "Nabha Medicare Hospital",
    type: "Multi-specialty",
    specialties: ["General Medicine", "Surgery", "Emergency Medicine"],
    address: "New Defence Colony, Cantt Road, Nabha - 147201",
    landmark: "Cantt Road, New Defence Colony",
    phones: ["+91-1765-223001", "+91-1765-223002"],
    primaryPhone: "+91-1765-223001",
    area: "New Defence Colony",
    verified: true,
    rating: 4.0,
    services: ["Emergency Care", "General Medicine", "Surgery", "ICU"],
    coordinates: { lat: 30.3735, lng: 76.1555 },
  },
  {
    id: 6,
    name: "Ekjyot Eye Hospital",
    type: "Eye Hospital",
    specialties: ["Ophthalmology", "Eye Surgery", "Retina Treatment"],
    address: "Patiala Gate, Sangatpura Colony, Nabha - 147201",
    landmark: "Patiala Gate, Sangatpura Colony",
    phones: ["076968-28462"],
    primaryPhone: "076968-28462",
    area: "Sangatpura Colony",
    verified: true,
    rating: 4.5,
    services: [
      "Eye Checkup",
      "Cataract Surgery",
      "Retina Treatment",
      "Glasses",
    ],
    coordinates: { lat: 30.3748, lng: 76.1542 },
  },
  {
    id: 7,
    name: "Aneja Children & Maternity Hospital",
    type: "Pediatric & Maternity",
    specialties: ["Pediatrics", "Maternity", "Neonatology"],
    address: "Hira Mahal Colony, Nabha - 147201",
    landmark: "Hira Mahal Colony",
    phones: ["01765-222996"],
    primaryPhone: "01765-222996",
    area: "Hira Mahal Colony",
    verified: true,
    rating: 4.4,
    services: ["Child Care", "Maternity", "Vaccination", "NICU"],
    coordinates: { lat: 30.3738, lng: 76.1547 },
  },
  {
    id: 8,
    name: "Garg Surgical & Children Hospital",
    type: "Surgical & Pediatric",
    specialties: ["General Surgery", "Pediatrics", "Orthopedic Surgery"],
    address: "Gali No 4, Shiva Enclave, Circular Road, Nabha - 147201",
    landmark: "Shiva Enclave, Circular Road",
    phones: ["01765-225135"],
    primaryPhone: "01765-225135",
    area: "Circular Road",
    verified: true,
    rating: 4.1,
    services: ["Surgery", "Child Care", "Emergency", "OPD"],
    coordinates: { lat: 30.3742, lng: 76.155 },
  },
];

// Hospital categories
export const hospitalCategories = [
  "All Hospitals",
  "Multi-specialty",
  "General Hospital",
  "Surgical Hospital",
  "Eye Hospital",
  "Pediatric & Maternity",
];

// Emergency contacts
export const emergencyContacts = [
  {
    service: "Ambulance",
    number: "108",
    description: "24x7 Free Ambulance Service",
  },
  {
    service: "Police",
    number: "100",
    description: "Emergency Police Service",
  },
  {
    service: "Fire",
    number: "101",
    description: "Fire Emergency Service",
  },
  {
    service: "Women Helpline",
    number: "1091",
    description: "Women in Distress",
  },
];

// Hospital areas in Nabha
export const nabhaAreas = [
  "Patiala Gate",
  "Hira Mahal Colony",
  "Bouran Gate",
  "New Defence Colony",
  "Circular Road",
  "Sangatpura Colony",
];

// Helper functions
export const getHospitalsByArea = (area) => {
  return nabhaHospitals.filter((hospital) => hospital.area === area);
};

export const getHospitalsByType = (type) => {
  if (type === "All Hospitals") return nabhaHospitals;
  return nabhaHospitals.filter((hospital) => hospital.type === type);
};

export const searchHospitals = (query) => {
  const searchTerm = query.toLowerCase();
  return nabhaHospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm) ||
      hospital.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm)
      ) ||
      hospital.area.toLowerCase().includes(searchTerm) ||
      hospital.services.some((service) =>
        service.toLowerCase().includes(searchTerm)
      )
  );
};

export const getVerifiedHospitals = () => {
  return nabhaHospitals.filter((hospital) => hospital.verified);
};

export const getHospitalsWithPhone = () => {
  return nabhaHospitals.filter((hospital) => hospital.phones.length > 0);
};
