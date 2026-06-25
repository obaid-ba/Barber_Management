import express from 'express';
import { appointment, getAppointments, updateAppointmentStatus, deleteAppointment, createService, deleteService, getServices, login,logout,signup, updateService, getClients, createClient, updateClient, deleteClient, getMyAppointments, getMe, updateMe } from '../controllers/auth.controller.js';
import { verifyToken, requireStaff, attachUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Staff-only: must be logged in as an admin or barber.
const staffOnly = [verifyToken, requireStaff];

// --- Public routes ---
router.post("/appointment", attachUser, appointment); // public booking, links to account when logged in
router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);
router.get("/services", getServices); // booking page needs the service list

// --- Authenticated self-service (any role) ---
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.get("/me/appointments", verifyToken, getMyAppointments);

// --- Protected (staff) routes ---
router.get("/appointments", staffOnly, getAppointments);
router.put("/appointment/:id/status", staffOnly, updateAppointmentStatus);
router.delete("/appointment/:id", staffOnly, deleteAppointment);

router.post("/service", staffOnly, createService);
router.delete("/service/:id", staffOnly, deleteService);
router.put("/service/:id", staffOnly, updateService);

router.get("/clients", staffOnly, getClients);
router.post("/client", staffOnly, createClient);
router.put("/client/:id", staffOnly, updateClient);
router.delete("/client/:id", staffOnly, deleteClient);

export default router;
