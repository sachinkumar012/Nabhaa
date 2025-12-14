import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationUseCases } from '../domain/LocationUseCases';

const LocationContext = createContext();

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const useCases = new LocationUseCases();

    useEffect(() => {
        // Load initial location
        const savedLocation = useCases.getLocation();
        if (savedLocation) {
            setLocation(savedLocation);
        }
        setIsLoading(false);
    }, []);

    const updatePincode = async (pincode) => {
        setIsLoading(true);
        setError(null);
        try {
            const newLocation = await useCases.updateLocation(pincode);
            setLocation(newLocation);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const detectLocation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newLocation = await useCases.detectLocation();
            setLocation(newLocation);
        } catch (err) {
            setError('Could not detect location. Please enter pincode manually.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocationContext.Provider value={{
            location,
            isLoading,
            error,
            updatePincode,
            detectLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocationContext must be used within a LocationProvider');
    }
    return context;
}
