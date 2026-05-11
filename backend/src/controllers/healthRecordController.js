const HealthRecord = require('../models/healthRecordModel');

exports.getRecords = async (req, res) => {
    try {
        const records = await HealthRecord.find({ patientId: req.user.id })
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch records', error: error.message });
    }
};

exports.createRecord = async (req, res) => {
    try {
        const { type, title, diagnosis, notes, fileUrl, offlineId, updatedAt } = req.body;
        
        const newRecord = new HealthRecord({
            patientId: req.user.id,
            doctorId: req.body.doctorId || null,
            type,
            title,
            diagnosis,
            notes,
            fileUrl,
            offlineId,
            updatedAt: updatedAt || Date.now()
        });

        await newRecord.save();
        res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create record', error: error.message });
    }
};

exports.syncRecords = async (req, res) => {
    try {
        const { actions } = req.body; // Array of queued actions from frontend SyncManager
        
        if (!actions || !Array.isArray(actions)) {
            return res.status(400).json({ success: false, message: 'Invalid actions array' });
        }

        const results = { successful: 0, conflicts: 0, failed: 0, details: [] };

        for (const action of actions) {
            try {
                if (action.method === 'POST') {
                    // Check if it already exists by offlineId
                    const existing = await HealthRecord.findOne({ offlineId: action.data.offlineId });
                    if (!existing) {
                        const newRecord = new HealthRecord({
                            patientId: req.user.id,
                            ...action.data
                        });
                        await newRecord.save();
                        results.successful++;
                    } else {
                        // Already exists, ignore duplicate
                        results.successful++;
                    }
                } else if (action.method === 'PUT') {
                    // Update existing record
                    const existing = await HealthRecord.findById(action.data._id);
                    if (!existing) {
                        results.failed++;
                        continue;
                    }

                    // Conflict Resolution: Timestamp + Server Priority
                    const clientTimestamp = new Date(action.data.updatedAt).getTime();
                    const serverTimestamp = new Date(existing.updatedAt).getTime();

                    if (serverTimestamp > clientTimestamp) {
                        // Conflict! Server is newer. 
                        results.conflicts++;
                        results.details.push({ id: existing._id, reason: 'Server timestamp is newer. Merge required.' });
                    } else {
                        // Client is newer or equal, apply updates
                        Object.assign(existing, action.data);
                        existing.updatedAt = Date.now();
                        await existing.save();
                        results.successful++;
                    }
                } else if (action.method === 'DELETE') {
                    await HealthRecord.findByIdAndDelete(action.data._id);
                    results.successful++;
                }
            } catch (err) {
                console.error('Sync error on action', action, err);
                results.failed++;
                results.details.push({ id: action.data?.offlineId || 'unknown', reason: err.message });
            }
        }

        res.status(200).json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
    }
};
