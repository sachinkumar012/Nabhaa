import localforage from 'localforage';
import CryptoJS from 'crypto-js';

// Secret key for AES encryption. In production, this should be derived from user session.
const SECRET_KEY = import.meta.env.VITE_OFFLINE_SECRET || 'nabhaa-offline-secret-123';

// Configure localforage
localforage.config({
  name: 'NabhaaHealth',
  storeName: 'health_records'
});

export const offlineStorage = {
  async setItem(key, data) {
    try {
      const jsonStr = JSON.stringify(data);
      const encryptedData = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
      await localforage.setItem(key, encryptedData);
      return true;
    } catch (err) {
      console.error('Offline storage write error', err);
      return false;
    }
  },

  async getItem(key) {
    try {
      const encryptedData = await localforage.getItem(key);
      if (!encryptedData) return null;
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedStr);
    } catch (err) {
      console.error('Offline storage read error', err);
      return null;
    }
  },

  async removeItem(key) {
    return await localforage.removeItem(key);
  },
  
  async clear() {
    return await localforage.clear();
  }
};
