const express = require("express");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Match = require("../models/Match");
const Registration = require("../models/Registration");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* =========================================================
   CREATE TOURNAMENT (ADMIN)
   ========================================================= */
// ================= ORGANIZER CAN CREATE TOURNAMENT =================
router.post(
  "/",
  auth,
  role("admin", "organizer"),
  upload.single("logo"),
  async (req, res) => {
    try {
      const {
        eventName,
        sportId,
        venueId,
        location,
        startDate,
        endDate,
        maxParticipants,
        description,
        rules,
      } = req.body;

      if (!eventName || !sportId || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }

      let logoUrl = "";
      if (req.file) {
        const localPath = path.resolve(req.file.path);
        const result = await cloudinary.uploader.upload(localPath, {
          folder: "tournament_logos",
        });
        logoUrl = result.secure_url;
        fs.unlinkSync(localPath);
      }

      const tournament = await Tournament.create({
        eventName,
        sportId,
        venueId,
        location,
        startDate,
        endDate,
        maxParticipants,
        description,
        rules,
        organizerId: req.user.userId,
        logo: logoUrl,
        status: "upcoming",
        teams: [],
        prizePool: 0,
      });

      res.status(201).json(tournament);
    } catch (err) {
      console.error("CREATE TOURNAMENT ERROR:", err);
      res.status(500).json({ message: "Tournament creation failed" });
    }
  }
);

// ================= GET MY TOURNAMENTS (FOR ORGANIZER) =================
router.get("/my-tournaments", auth, async (req, res) => {
  try {
    const tournaments = await Tournament.find({ organizerId: req.user.userId })
      .populate("sportId", "name")
      .populate("teams", "teamName");
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   PUBLIC - GET ALL TOURNAMENTS (NO AUTH REQUIRED)
   ========================================================= */
router.get("/public", async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("sportId", "name")
      .populate("teams", "teamName")
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (err) {
    console.error("FETCH TOURNAMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to load tournaments" });
  }
});

/* =========================================================
   PUBLIC - GET SINGLE TOURNAMENT (NO AUTH REQUIRED)
   ========================================================= */
router.get("/public/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("sportId", "name")
      .populate("teams", "teamName")
      .populate("venueId", "name");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (err) {
    console.error("FETCH TOURNAMENT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tournament" });
  }
});

/* =========================================================
   ADMIN ONLY - GET ALL TOURNAMENTS
   ========================================================= */
router.get("/", auth, role("admin"), async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("sportId", "name")
      .populate("teams", "teamName")
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (err) {
    console.error("FETCH TOURNAMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to load tournaments" });
  }
});

/* =========================================================
   GET SINGLE TOURNAMENT (AUTH OPTIONAL)
   ========================================================= */
router.get("/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("sportId", "name")
      .populate("teams", "teamName")
      .populate("venueId", "name");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (err) {
    console.error("FETCH TOURNAMENT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tournament" });
  }
});

/* =========================================================
   UPDATE TOURNAMENT (ADMIN)
   ========================================================= */
router.put(
  "/:id",
  auth,
  role("admin"),
  upload.single("logo"),
  async (req, res) => {
    try {
      const updateData = {
        eventName: req.body.eventName,
        sportId: req.body.sportId,
        venueId: req.body.venueId,
        location: req.body.location,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        maxParticipants: req.body.maxParticipants,
        description: req.body.description,
        rules: req.body.rules,
        status: req.body.status,
      };

      // remove undefined values
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      if (req.file) {
        try {
          const localPath = path.resolve(req.file.path);
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "tournament_logos",
            resource_type: "image",
          });
          updateData.logo = result.secure_url;
          fs.unlinkSync(localPath);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }

      const updatedTournament = await Tournament.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedTournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      res.json(updatedTournament);
    } catch (err) {
      console.error("UPDATE TOURNAMENT ERROR:", err);
      res.status(500).json({ message: "Tournament update failed" });
    }
  }
);

/* =========================================================
   DELETE TOURNAMENT (ADMIN)
   ========================================================= */
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const deleted = await Tournament.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json({ message: "Tournament deleted successfully" });
  } catch (err) {
    console.error("DELETE TOURNAMENT ERROR:", err);
    res.status(500).json({ message: "Tournament deletion failed" });
  }
});

/* =========================================================
   GET MATCHES BY TOURNAMENT (PUBLIC)
   ========================================================= */
router.get("/:id/matches", async (req, res) => {
  try {
    const matches = await Match.find({ tournamentId: req.params.id })
      .populate("teams", "teamName")
      .populate("venueId", "name");

    res.json(matches);
  } catch (err) {
    console.error("FETCH MATCHES ERROR:", err);
    res.status(500).json({ message: "Failed to load matches" });
  }
});

module.exports = router;