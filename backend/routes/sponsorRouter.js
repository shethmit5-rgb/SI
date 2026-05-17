const express = require("express");
const Sponsor = require("../models/Sponsor");
const Tournament = require("../models/Tournament");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* ================= CREATE SPONSOR (ADMIN & ORGANIZER) ================= */
router.post(
  "/",
  auth,
  upload.single("logo"),
  async (req, res) => {
    try {
      const { name, amount, tournamentId } = req.body;

      if (!name || !amount || !tournamentId) {
        return res.status(400).json({ message: "All fields required" });
      }

      // ✅ Check if user is admin OR tournament organizer
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      if (req.user.role !== "admin" && tournament.organizerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Only admin or tournament organizer can add sponsors" });
      }

      let logoUrl = "";

      // Upload to Cloudinary if file exists
      if (req.file) {
        try {
          const localPath = path.resolve(req.file.path);
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "sponsor_logos",
            resource_type: "image",
          });
          logoUrl = result.secure_url;
          fs.unlinkSync(localPath);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }

      const sponsor = new Sponsor({
        name,
        amount: Number(amount),
        tournamentId,
        logo: logoUrl,
      });

      await sponsor.save();

      // 🔥 UPDATE PRIZE POOL
      await Tournament.findByIdAndUpdate(tournamentId, {
        $inc: { prizePool: Number(amount) },
      });

      res.status(201).json({ message: "Sponsor added successfully", sponsor });
    } catch (err) {
      console.error("CREATE SPONSOR ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ================= GET SPONSORS (ADMIN & ORGANIZER) ================= */
router.get("/", auth, async (req, res) => {
  try {
    let sponsors;
    
    if (req.user.role === "admin") {
      // Admin sees all sponsors
      sponsors = await Sponsor.find().populate("tournamentId", "eventName sportId startDate");
    } else {
      // Organizer only sees sponsors for their tournaments
      const tournaments = await Tournament.find({ organizerId: req.user.userId });
      const tournamentIds = tournaments.map(t => t._id);
      sponsors = await Sponsor.find({ tournamentId: { $in: tournamentIds } }).populate("tournamentId", "eventName sportId startDate");
    }
    
    res.json(sponsors);
  } catch (err) {
    console.error("GET SPONSORS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET SPONSORSHIP STATISTICS (ADMIN & ORGANIZER) ================= */
router.get("/stats", auth, async (req, res) => {
  try {
    let sponsors;
    
    if (req.user.role === "admin") {
      // Admin sees all sponsors
      sponsors = await Sponsor.find().populate("tournamentId", "eventName");
    } else {
      // Organizer only sees sponsors for their tournaments
      const tournaments = await Tournament.find({ organizerId: req.user.userId });
      const tournamentIds = tournaments.map(t => t._id);
      sponsors = await Sponsor.find({ tournamentId: { $in: tournamentIds } }).populate("tournamentId", "eventName");
    }
    
    // Group sponsors by tournament for chart data
    const tournamentStats = {};
    
    sponsors.forEach(sponsor => {
      const tournamentName = sponsor.tournamentId?.eventName || "Unknown Tournament";
      const amount = sponsor.amount || 0;
      
      if (tournamentStats[tournamentName]) {
        tournamentStats[tournamentName] += amount;
      } else {
        tournamentStats[tournamentName] = amount;
      }
    });
    
    // Convert to array format for chart
    const chartData = Object.entries(tournamentStats).map(([eventName, totalAmount]) => ({
      eventName,
      amount: totalAmount,
    }));
    
    // Calculate total and additional stats
    const totalSponsorship = sponsors.reduce((sum, s) => sum + (s.amount || 0), 0);
    const averageSponsorship = sponsors.length > 0 ? totalSponsorship / sponsors.length : 0;
    
    res.json({
      chartData,
      summary: {
        totalSponsors: sponsors.length,
        totalSponsorship,
        averageSponsorship,
      }
    });
  } catch (err) {
    console.error("GET SPONSORSHIP STATS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= PUBLIC GET SPONSORS (NO AUTH) ================= */
router.get("/public", async (req, res) => {
  try {
    const sponsors = await Sponsor.find().populate("tournamentId", "eventName");
    res.json(sponsors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPDATE SPONSOR (ADMIN & ORGANIZER) ================= */
router.put(
  "/:id",
  auth,
  upload.single("logo"),
  async (req, res) => {
    try {
      const sponsor = await Sponsor.findById(req.params.id).populate("tournamentId");
      if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

      // ✅ Check permission
      if (req.user.role !== "admin" && sponsor.tournamentId.organizerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Only admin or tournament organizer can update sponsors" });
      }

      const oldAmount = sponsor.amount;
      const newAmount = Number(req.body.amount) || oldAmount;
      const diff = newAmount - oldAmount;

      sponsor.name = req.body.name || sponsor.name;
      sponsor.amount = newAmount;

      // Upload new logo to Cloudinary if provided
      if (req.file) {
        try {
          const localPath = path.resolve(req.file.path);
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "sponsor_logos",
            resource_type: "image",
          });
          sponsor.logo = result.secure_url;
          fs.unlinkSync(localPath);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }

      await sponsor.save();

      // 🔥 UPDATE PRIZE POOL DIFFERENCE
      if (diff !== 0) {
        await Tournament.findByIdAndUpdate(sponsor.tournamentId, {
          $inc: { prizePool: diff },
        });
      }

      res.json({ message: "Sponsor updated successfully", sponsor });
    } catch (err) {
      console.error("UPDATE SPONSOR ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ================= DELETE SPONSOR (ADMIN & ORGANIZER) ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id).populate("tournamentId");
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    // ✅ Check permission
    if (req.user.role !== "admin" && sponsor.tournamentId.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only admin or tournament organizer can delete sponsors" });
    }

    // Update prize pool by subtracting sponsor amount
    await Tournament.findByIdAndUpdate(sponsor.tournamentId, {
      $inc: { prizePool: -sponsor.amount },
    });

    await sponsor.deleteOne();
    res.json({ message: "Sponsor removed successfully" });
  } catch (err) {
    console.error("DELETE SPONSOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET SPONSORS BY TOURNAMENT (AUTHENTICATED) ================= */
router.get("/tournament/:tournamentId", auth, async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ tournamentId: req.params.tournamentId });
    res.json(sponsors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= PUBLIC ROUTE - GET SPONSORS BY TOURNAMENT ================= */
router.get("/public/tournament/:tournamentId", async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ tournamentId: req.params.tournamentId });
    res.json(sponsors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ... all your route definitions above ...

/* ================= GET SINGLE SPONSOR BY ID ================= */
router.get("/:id", auth, async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id).populate("tournamentId", "eventName organizerId");
    
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }
    
    if (req.user.role !== "admin") {
      const tournament = await Tournament.findById(sponsor.tournamentId);
      if (tournament && tournament.organizerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    res.json(sponsor);
  } catch (err) {
    console.error("GET SPONSOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ EXPORT THE ROUTER - THIS IS THE CORRECT SYNTAX
module.exports = router;