const express = require("express");
const Match = require("../models/Match");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

/* ================= CREATE MATCH (ADMIN & ORGANIZER) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { tournamentId, teams, matchDate, venueId } = req.body;

    /* BASIC VALIDATION */
    if (!tournamentId || !teams || teams.length !== 2 || !matchDate || !venueId) {
      return res.status(400).json({ message: "Invalid match data" });
    }

    if (teams[0] === teams[1]) {
      return res.status(400).json({ message: "Team A and Team B must be different" });
    }

    // Check if user is admin or tournament organizer
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Allow if admin OR tournament organizer
    if (req.user.role !== "admin" && tournament.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only admin or tournament organizer can create matches" });
    }

    /* CHECK TEAMS BELONG TO TOURNAMENT */
    const teamDocs = await Team.find({
      _id: { $in: teams },
      tournamentId,
    });

    if (teamDocs.length !== 2) {
      return res.status(400).json({
        message: "Both teams must belong to the selected tournament",
      });
    }

    const match = await Match.create({
      tournamentId,
      teams,
      matchDate,
      venueId,
      createdBy: req.user.userId,
      status: "scheduled",
    });

    res.status(201).json(match);
  } catch (err) {
    console.error("CREATE MATCH ERROR:", err);
    res.status(500).json({ message: "Match creation failed" });
  }
});

/* ================= GET ALL MATCHES (PUBLIC - NO AUTH) ================= */
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("teams", "teamName")
      .populate("venueId", "name")
      .populate("tournamentId", "eventName")
      .sort({ matchDate: 1 });

    res.json(matches);
  } catch (err) {
    console.error("FETCH MATCHES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});

/* ================= GET MATCHES BY TOURNAMENT (PUBLIC - NO AUTH) ================= */
router.get("/tournament/:id", async (req, res) => {
  try {
    const matches = await Match.find({ tournamentId: req.params.id })
      .populate("teams", "teamName")
      .populate("venueId", "name")
      .sort({ matchDate: 1 });

    res.json(matches);
  } catch (err) {
    console.error("FETCH MATCHES ERROR:", err);
    res.status(500).json({ message: "Failed to load matches" });
  }
});

/* ================= GET UPCOMING MATCHES (PUBLIC - NO AUTH) ================= */
router.get("/public/upcoming", async (req, res) => {
  try {
    const matches = await Match.find({ 
      status: "scheduled",
      matchDate: { $gte: new Date() }
    })
      .populate("teams", "teamName")
      .populate("venueId", "name")
      .populate("tournamentId", "eventName")
      .sort({ matchDate: 1 })
      .limit(10);

    res.json(matches);
  } catch (err) {
    console.error("UPCOMING MATCHES ERROR:", err);
    res.status(500).json({ message: "Failed to load upcoming matches" });
  }
});

/* ================= GET COMPLETED MATCHES (PUBLIC - NO AUTH) ================= */
router.get("/public/completed", async (req, res) => {
  try {
    const matches = await Match.find({ status: "completed" })
      .populate("teams", "teamName")
      .populate("venueId", "name")
      .populate("tournamentId", "eventName")
      .sort({ matchDate: -1 })
      .limit(20);

    res.json(matches);
  } catch (err) {
    console.error("COMPLETED MATCHES ERROR:", err);
    res.status(500).json({ message: "Failed to load completed matches" });
  }
});

/* ================= UPDATE MATCH RESULT (ADMIN & ORGANIZER) ================= */
router.put("/:id/result", auth, async (req, res) => {
  try {
    const { winnerTeamId, score, status } = req.body;
    const match = await Match.findById(req.params.id).populate("tournamentId");
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && match.tournamentId.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only admin or tournament organizer can update match results" });
    }

    if (winnerTeamId) {
      match.result.winnerTeamId = winnerTeamId;
    }
    
    if (score) {
      match.result.score = score;
    }
    
    if (status) {
      match.status = status;
    }

    await match.save();

    res.json({ message: "Match result updated", match });
  } catch (err) {
    console.error("UPDATE MATCH RESULT ERROR:", err);
    res.status(500).json({ message: "Failed to update match result" });
  }
});

/* ================= GET SINGLE MATCH (PUBLIC) ================= */
router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teams", "teamName captainId")
      .populate("venueId", "name address")
      .populate("tournamentId", "eventName");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (err) {
    console.error("FETCH SINGLE MATCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch match" });
  }
});

/* ================= DELETE MATCH (ADMIN & ORGANIZER) ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("tournamentId");
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && match.tournamentId.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only admin or tournament organizer can delete matches" });
    }

    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: "Match deleted successfully" });
  } catch (err) {
    console.error("DELETE MATCH ERROR:", err);
    res.status(500).json({ message: "Failed to delete match" });
  }
});

module.exports = router;