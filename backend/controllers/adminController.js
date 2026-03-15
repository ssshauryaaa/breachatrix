const prisma = require("../config/prisma");

// ------------------- DASHBOARD OVERVIEW -------------------
// GET /api/admin/dashboard
// Returns total counts, scores, and recent activity
exports.getDashboard = async (req, res) => {
  try {
    const [userCount, teamCount, attackCount, defenseCount, teams] =
      await Promise.all([
        prisma.user.count(),
        prisma.team.count(),
        prisma.attackLog.count(),
        prisma.defenseLog.count(),
        prisma.team.findMany({
          select: {
            id: true,
            name: true,
            role: true,
            score: true,
            _count: { select: { members: true } },
          },
          orderBy: { score: "desc" },
        }),
      ]);

    res.json({
      stats: { userCount, teamCount, attackCount, defenseCount },
      leaderboard: teams,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- GET ALL USERS -------------------
// GET /api/admin/users
// Lists all users with their team assignments
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        teamMember: {
          select: {
            team: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- DELETE USER -------------------
// DELETE /api/admin/users/:id
// Removes a user (and their TeamMember record via cascade)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove team membership first (no cascade on schema)
    await prisma.teamMember.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- GET ALL TEAMS -------------------
// GET /api/admin/teams
// Lists all teams with members and scores
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, role: true } },
          },
        },
      },
      orderBy: { score: "desc" },
    });

    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- CREATE TEAM -------------------
// POST /api/admin/teams
// Body: { name, role }  — role must be "RED" or "BLUE"
exports.createTeam = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!["RED", "BLUE"].includes(role)) {
      return res.status(400).json({ error: "Role must be RED or BLUE" });
    }

    const team = await prisma.team.create({
      data: { name, role },
    });

    res.status(201).json({ message: "Team created", team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- DELETE TEAM -------------------
// DELETE /api/admin/teams/:id
// Removes a team and its member records
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.teamMember.deleteMany({ where: { teamId: id } });
    await prisma.attackLog.deleteMany({
      where: { OR: [{ attackerId: id }, { targetTeamId: id }] },
    });
    await prisma.defenseLog.deleteMany({ where: { teamId: id } });
    await prisma.team.delete({ where: { id } });

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- ASSIGN USER TO TEAM -------------------
// POST /api/admin/teams/:teamId/members
// Body: { userId }
exports.assignUserToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    // Check team member count (max 4 per team)
    const count = await prisma.teamMember.count({ where: { teamId } });
    if (count >= 4) {
      return res.status(400).json({ error: "Team is full (max 4 members)" });
    }

    const membership = await prisma.teamMember.upsert({
      where: { userId },
      update: { teamId },
      create: { userId, teamId },
    });

    res.json({ message: "User assigned to team", membership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- REMOVE USER FROM TEAM -------------------
// DELETE /api/admin/teams/:teamId/members/:userId
exports.removeUserFromTeam = async (req, res) => {
  try {
    const { userId } = req.params;

    await prisma.teamMember.delete({ where: { userId } });

    res.json({ message: "User removed from team" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- ADJUST TEAM SCORE -------------------
// PATCH /api/admin/teams/:id/score
// Body: { delta }  — positive to add, negative to subtract
exports.adjustScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body;

    if (typeof delta !== "number") {
      return res.status(400).json({ error: "delta must be a number" });
    }

    const team = await prisma.team.update({
      where: { id },
      data: { score: { increment: delta } },
    });

    res.json({ message: "Score updated", team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- RESET ALL SCORES -------------------
// POST /api/admin/scores/reset
// Wipes all scores to 0 — use at start of new round
exports.resetAllScores = async (req, res) => {
  try {
    await prisma.team.updateMany({ data: { score: 0 } });

    res.json({ message: "All scores reset to 0" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- GET ALL ATTACK LOGS -------------------
// GET /api/admin/logs/attacks
// Optional query: ?teamId=xxx  to filter by attacker
exports.getAttackLogs = async (req, res) => {
  try {
    const { teamId } = req.query;

    const logs = await prisma.attackLog.findMany({
      where: teamId ? { attackerId: teamId } : undefined,
      include: {
        attacker: { select: { id: true, name: true } },
        target: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- GET ALL DEFENSE LOGS -------------------
// GET /api/admin/logs/defenses
// Optional query: ?teamId=xxx
exports.getDefenseLogs = async (req, res) => {
  try {
    const { teamId } = req.query;

    const logs = await prisma.defenseLog.findMany({
      where: teamId ? { teamId } : undefined,
      include: {
        team: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- CLEAR ALL LOGS -------------------
// DELETE /api/admin/logs
// Hard reset — clears attack and defense logs
exports.clearAllLogs = async (req, res) => {
  try {
    await prisma.attackLog.deleteMany();
    await prisma.defenseLog.deleteMany();

    res.json({ message: "All logs cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- PROMOTE USER TO ADMIN -------------------
// PATCH /api/admin/users/:id/promote
exports.promoteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { role: "admin" },
      select: { id: true, username: true, role: true },
    });

    res.json({ message: "User promoted to admin", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
