import { Location } from '../domain/LocationEntity';

const STORAGE_KEY = 'nabha_user_location';

export class LocationRepository {
    save(location) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
            return true;
        } catch (error) {
            console.error('Error saving location:', error);
            return false;
        }
    }

    get() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return null;
            return new Location(JSON.parse(data));
        } catch (error) {
            console.error('Error getting location:', error);
            return null;
        }
    }

    async getFromCoordinates(latitude, longitude) {
        // In a real app, this would call a reverse geocoding API
        // For now, we'll return a mock location based on coordinates
        return new Location({
            pincode: '144401', // Mock pincode for Nabha/surroundings
            city: 'Nabha',
            state: 'Punjab',
            latitude,
            longitude
        });
    }

    async getFromPincode(pincode) {
        // In a real app, this would call an API to validate pincode and get city/state
        // Mock implementation
        return new Location({
            pincode,
            city: 'Nabha', // Defaulting to Nabha for demo
            state: 'Punjab'
        });
    }
}
