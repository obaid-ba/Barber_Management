import express from 'express';
import { appointment, getAppointments, updateAppointmentStatus, deleteAppointment, createService, deleteService, getServices, login,logout,signup, updateService, getClients, createClient, updateClient, deleteClient } from '../controllers/auth.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Staff-only: must be logged in as an admin.
const adminOnly = [verifyToken, requireAdmin];

// --- Public routes ---
router.post("/appointment", appointment); // public booking
router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);
router.get("/services", getServices); // booking page needs the service list

// --- Protected (admin) routes ---
router.get("/appointments", adminOnly, getAppointments);
router.put("/appointment/:id/status", adminOnly, updateAppointmentStatus);
router.delete("/appointment/:id", adminOnly, deleteAppointment);

router.post("/service", adminOnly, createService);
router.delete("/service/:id", adminOnly, deleteService);
router.put("/service/:id", adminOnly, updateService);

router.get("/clients", adminOnly, getClients);
router.post("/client", adminOnly, createClient);
router.put("/client/:id", adminOnly, updateClient);
router.delete("/client/:id", adminOnly, deleteClient);

export default router;
