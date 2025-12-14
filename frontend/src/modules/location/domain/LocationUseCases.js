import { LocationRepository } from '../data/LocationRepository';

export class LocationUseCases {
    constructor() {
        this.repository = new LocationRepository();
    }

    getLocation() {
        return this.repository.get();
    }

    async updateLocation(pincode) {
        const location = await this.repository.getFromPincode(pincode);
        if (location && location.isValid()) {
            this.repository.save(location);
            return location;
        }
        throw new Error('Invalid Pincode');
    }

    async detectLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const location = await this.repository.getFromCoordinates(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        this.repository.save(location);
                        resolve(location);
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
}
