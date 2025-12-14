/**
 * Location Entity
 * Represents a user's delivery location.
 */
export class Location {
    constructor({ pincode, city = '', state = '', latitude = null, longitude = null }) {
        this.pincode = pincode;
        this.city = city;
        this.state = state;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    isValid() {
        return this.pincode && this.pincode.length === 6;
    }
}
