import { createContext, useContext, useState, useEffect } from 'react';

const HealthContext = createContext();

export function HealthProvider({ children }) {
  const [healthRecords, setHealthRecords] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load health records from localStorage
    const savedRecords = localStorage.getItem('nabha-health-records');
    if (savedRecords) {
      try {
        setHealthRecords(JSON.parse(savedRecords));
      } catch (error) {
        console.error('Error loading health records:', error);
      }
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveHealthRecord = (record) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      synced: isOnline,
    };
    
    const updatedRecords = [...healthRecords, newRecord];
    setHealthRecords(updatedRecords);
    
    // Save to localStorage for offline support
    localStorage.setItem('nabha-health-records', JSON.stringify(updatedRecords));
    
    // TODO: Sync with backend when online
    if (isOnline) {
      syncWithBackend(newRecord);
    }
  };

  const syncWithBackend = async (record) => {
    // Placeholder for backend synchronization
    try {
      console.log('Syncing record with backend:', record);
      // await api.syncHealthRecord(record);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <HealthContext.Provider value={{
      healthRecords,
      saveHealthRecord,
      isOnline,
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}