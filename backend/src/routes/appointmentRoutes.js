const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointmentsForDoctor, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', bookAppointment);
router.get('/doctor/list', protect, getAppointmentsForDoctor);
router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;
