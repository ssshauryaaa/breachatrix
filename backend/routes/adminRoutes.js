const express = require("express");
const router = express.Router();

const admin = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ FIX
const requireRole = require("../middleware/requireRole"); // likely fix too

// All admin routes require a valid JWT AND role === "admin"
router.use(authMiddleware);
router.use(requireRole("admin"));

// ── Dashboard ────────────────────────────────────────────────
router.get("/dashboard", admin.getDashboard);

// ── Users ────────────────────────────────────────────────────
router.get("/users", admin.getAllUsers);
router.delete("/users/:id", admin.deleteUser);
router.patch("/users/:id/promote", admin.promoteUser);

// ── Teams ────────────────────────────────────────────────────
router.get("/teams", admin.getAllTeams);
router.post("/teams", admin.createTeam);
router.delete("/teams/:id", admin.deleteTeam);

// ── Team membership ──────────────────────────────────────────
router.post("/teams/:teamId/members", admin.assignUserToTeam);
router.delete("/teams/:teamId/members/:userId", admin.removeUserFromTeam);

// ── Scoring ──────────────────────────────────────────────────
router.patch("/teams/:id/score", admin.adjustScore);
router.post("/scores/reset", admin.resetAllScores);

// ── Logs ─────────────────────────────────────────────────────
router.get("/logs/attacks", admin.getAttackLogs);
router.get("/logs/defenses", admin.getDefenseLogs);
router.delete("/logs", admin.clearAllLogs);

module.exports = router;
