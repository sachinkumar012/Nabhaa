const axios = require('axios');
const Medicine = require('../models/Medicine');
const DrugInteraction = require('../models/DrugInteraction');

class HybridDrugService {
    /**
     * Integrate RxNorm API to fetch generic drug intelligence
     */
    static async searchRxNorm(drugName) {
        try {
            const rxnormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`;
            const response = await axios.get(rxnormUrl);
            
            // Extract the core concepts
            const conceptGroup = response.data?.drugGroup?.conceptGroup || [];
            if (!conceptGroup || conceptGroup.length === 0) return null;

            // Search for precise ingredient or Semantic Clinical Drug
            let salt = null;
            let form = null;
            
            for (const group of conceptGroup) {
                if (group.conceptProperties && group.conceptProperties.length > 0) {
                    const bestMatch = group.conceptProperties[0];
                    salt = bestMatch.name; // E.g., Paracetamol Oral Tablet
                    // Extract a basic form (tablet, syrup, etc.)
                    form = bestMatch.name.toLowerCase().includes('tablet') ? 'tablet' : 
                           bestMatch.name.toLowerCase().includes('syrup') ? 'syrup' : 
                           bestMatch.name.toLowerCase().includes('capsule') ? 'capsule' : 'unknown';
                           
                    return {
                        rxCUI: bestMatch.rxcui,
                        salt: salt,
                        form: form
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('RxNorm API Error:', error.message);
            return null;
        }
    }

    /**
     * CORE LOGIC FLOW: MongoDB Search -> Fallback to RxNorm
     */
    static async searchMedicine(drugName) {
        // 1. Search Internal Database First (Exact or Regex mapping)
        let localMedicine = await Medicine.findOne({ name: { $regex: new RegExp(`^${drugName}$`, 'i') } });
        
        if (localMedicine) {
            return {
                source: "database",
                original: localMedicine,
                safety: await this.checkSafety(localMedicine.composition)
            };
        }

        // 2. Not found in DB -> Call RxNorm
        const rxIntelligence = await this.searchRxNorm(drugName);
        if (!rxIntelligence) {
            return {
                source: "not_found",
                error: "Medicine not found in database and RxNorm intelligence could not identify it."
            };
        }

        // 3. Search DB for alternatives using the extracted salt/intelligence
        // We do a text split approach since RxNorm strings often have standard formulas
        const saltTerm = rxIntelligence.salt.split(' ')[0]; // Basic token match

        const substitutes = await Medicine.find({
            composition: { $regex: new RegExp(saltTerm, 'i') },
            isDiscontinued: false
        }).limit(5);

        return {
            source: "rxnorm",
            original: {
                name: rxIntelligence.salt,
                rxCUI: rxIntelligence.rxCUI,
                inferredForm: rxIntelligence.form
            },
            substitutes: substitutes,
            safety: await this.checkSafety(saltTerm)
        };
    }

    /**
     * Get Substitutes explicitly using Salt
     */
    static async getSubstitutesBySalt(saltName) {
        return await Medicine.find({
            composition: { $regex: new RegExp(saltName, 'i') },
            isDiscontinued: false
        });
    }

    /**
     * BASIC SAFETY CHECK MODULE
     */
    static async checkSafety(saltString) {
        if (!saltString) return { safe: true, warning: null };
        
        // This simulates a general lookup if the newly requested drug
        // has ANY historically contraindicated mappings recorded in our DB
        const terms = saltString.split(' ');
        const warningInteractions = [];

        // Simple mock validation against our DB
        for (const term of terms) {
            if (term.length < 3) continue;
            
            const checks = await DrugInteraction.find({
                $or: [
                    { salt1: { $regex: new RegExp(term, 'i') } },
                    { salt2: { $regex: new RegExp(term, 'i') } }
                ]
            });
            
            if (checks && checks.length > 0) {
                warningInteractions.push(...checks.map(c => c.description));
            }
        }

        if (warningInteractions.length > 0) {
            return {
                safe: false,
                warning: warningInteractions[0] // Return highest warning
            };
        }

        return {
            safe: true,
            warning: null
        };
    }
}

module.exports = HybridDrugService;
