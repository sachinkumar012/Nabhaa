import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    home: 'Home',
    doctors: 'Doctors',
    records: 'Health Records',
    pharmacy: 'Pharmacy',
    symptoms: 'Symptom Checker',
    about: 'About',
    
    // Home Page
    welcome: 'Welcome to Nabha Healthcare',
    subtitle: 'Quality Healthcare for Rural Communities',
    description: 'Access doctors, manage health records, and get medical guidance from the comfort of your home.',
    getStarted: 'Get Started',
    
    // Doctors
    doctorsList: 'Our Doctors',
    availability: 'Available Now',
    unavailable: 'Currently Busy',
    consultNow: 'Consult Now',
    experience: 'years experience',
    
    // Health Records
    healthRecords: 'Health Records',
    addRecord: 'Add New Record',
    patientName: 'Patient Name',
    symptoms: 'Symptoms',
    diagnosis: 'Diagnosis',
    prescription: 'Prescription',
    date: 'Date',
    save: 'Save Record',
    
    // Pharmacy
    medicineAvailability: 'Medicine Availability',
    searchMedicine: 'Search medicine...',
    available: 'Available',
    outOfStock: 'Out of Stock',
    
    // Symptom Checker
    symptomChecker: 'AI Symptom Checker',
    enterSymptoms: 'Describe your symptoms...',
    checkSymptoms: 'Check Symptoms',
    
    // About
    aboutUs: 'About Nabha Healthcare',
    mission: 'Our Mission',
    missionText: 'To provide accessible, quality healthcare services to rural communities through technology.',
    
    // Common
    loading: 'Loading...',
    close: 'Close',
    cancel: 'Cancel',
    language: 'Language',
  },
  
  hi: {
    // Navigation
    home: 'मुख्य पृष्ठ',
    doctors: 'डॉक्टर',
    records: 'स्वास्थ्य रिकॉर्ड',
    pharmacy: 'फार्मेसी',
    symptoms: 'लक्षण जांचकर्ता',
    about: 'हमारे बारे में',
    
    // Home Page
    welcome: 'नाभा हेल्थकेयर में आपका स्वागत है',
    subtitle: 'ग्रामीण समुदायों के लिए गुणवत्तापूर्ण स्वास्थ्य सेवा',
    description: 'घर के आराम से डॉक्टरों से मिलें, स्वास्थ्य रिकॉर्ड प्रबंधित करें, और चिकित्सा मार्गदर्शन प्राप्त करें।',
    getStarted: 'शुरू करें',
    
    // Doctors
    doctorsList: 'हमारे डॉक्टर',
    availability: 'अभी उपलब्ध',
    unavailable: 'व्यस्त',
    consultNow: 'अभी परामर्श लें',
    experience: 'वर्षों का अनुभव',
    
    // Health Records
    healthRecords: 'स्वास्थ्य रिकॉर्ड',
    addRecord: 'नया रिकॉर्ड जोड़ें',
    patientName: 'मरीज़ का नाम',
    symptoms: 'लक्षण',
    diagnosis: 'निदान',
    prescription: 'दवा',
    date: 'दिनांक',
    save: 'रिकॉर्ड सेव करें',
    
    // Pharmacy
    medicineAvailability: 'दवा की उपलब्धता',
    searchMedicine: 'दवा खोजें...',
    available: 'उपलब्ध',
    outOfStock: 'स्टॉक में नहीं',
    
    // Symptom Checker
    symptomChecker: 'AI लक्षण जांचकर्ता',
    enterSymptoms: 'अपने लक्षण बताएं...',
    checkSymptoms: 'लक्षण जांचें',
    
    // About
    aboutUs: 'नाभा हेल्थकेयर के बारे में',
    mission: 'हमारा मिशन',
    missionText: 'प्रौद्योगिकी के माध्यम से ग्रामीण समुदायों को सुलभ, गुणवत्तापूर्ण स्वास्थ्य सेवाएं प्रदान करना।',
    
    // Common
    loading: 'लोड हो रहा है...',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    language: 'भाषा',
  },
  
  pa: {
    // Navigation
    home: 'ਘਰ',
    doctors: 'ਡਾਕਟਰ',
    records: 'ਸਿਹਤ ਰਿਕਾਰਡ',
    pharmacy: 'ਦਵਾਈ ਦੁਕਾਨ',
    symptoms: 'ਲੱਛਣ ਜਾਂਚਕਰਤਾ',
    about: 'ਸਾਡੇ ਬਾਰੇ',
    
    // Home Page
    welcome: 'ਨਾਭਾ ਹੈਲਥਕੇਅਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    subtitle: 'ਪੇਂਡੂ ਭਾਈਚਾਰਿਆਂ ਲਈ ਗੁਣਵੱਤਾ ਸਿਹਤ ਸੇਵਾ',
    description: 'ਘਰ ਦੇ ਆਰਾਮ ਤੋਂ ਡਾਕਟਰਾਂ ਨਾਲ ਮਿਲੋ, ਸਿਹਤ ਰਿਕਾਰਡ ਪ੍ਰਬੰਧਿਤ ਕਰੋ, ਅਤੇ ਮੈਡੀਕਲ ਗਾਈਡੈਂਸ ਪ੍ਰਾਪਤ ਕਰੋ।',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
    
    // Doctors
    doctorsList: 'ਸਾਡੇ ਡਾਕਟਰ',
    availability: 'ਹੁਣ ਉਪਲਬਧ',
    unavailable: 'ਰੁਝਿਆ ਹੋਇਆ',
    consultNow: 'ਹੁਣ ਸਲਾਹ ਲਓ',
    experience: 'ਸਾਲ ਦਾ ਤਜਰਬਾ',
    
    // Health Records
    healthRecords: 'ਸਿਹਤ ਰਿਕਾਰਡ',
    addRecord: 'ਨਵਾਂ ਰਿਕਾਰਡ ਜੋੜੋ',
    patientName: 'ਮਰੀਜ਼ ਦਾ ਨਾਮ',
    symptoms: 'ਲੱਛਣ',
    diagnosis: 'ਨਿਦਾਨ',
    prescription: 'ਦਵਾਈ',
    date: 'ਤਾਰੀਖ',
    save: 'ਰਿਕਾਰਡ ਸੇਵ ਕਰੋ',
    
    // Pharmacy
    medicineAvailability: 'ਦਵਾਈ ਦੀ ਉਪਲਬਧਤਾ',
    searchMedicine: 'ਦਵਾਈ ਲੱਭੋ...',
    available: 'ਉਪਲਬਧ',
    outOfStock: 'ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ',
    
    // Symptom Checker
    symptomChecker: 'AI ਲੱਛਣ ਜਾਂਚਕਰਤਾ',
    enterSymptoms: 'ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ...',
    checkSymptoms: 'ਲੱਛਣ ਜਾਂਚੋ',
    
    // About
    aboutUs: 'ਨਾਭਾ ਹੈਲਥਕੇਅਰ ਬਾਰੇ',
    mission: 'ਸਾਡਾ ਮਿਸ਼ਨ',
    missionText: 'ਤਕਨੀਕ ਰਾਹੀਂ ਪੇਂਡੂ ਭਾਈਚਾਰਿਆਂ ਨੂੰ ਪਹੁੰਚਯੋਗ, ਗੁਣਵੱਤਾ ਸਿਹਤ ਸੇਵਾਵਾਂ ਪ੍ਰਦਾਨ ਕਰਨਾ।',
    
    // Common
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    close: 'ਬੰਦ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    language: 'ਭਾਸ਼ਾ',
  },
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('nabha-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('nabha-language', lang);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      translations,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}