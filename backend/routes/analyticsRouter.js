const express = require("express");
const Tournament = require("../models/Tournament");
const User = require("../models/User");
const Match = require("../models/Match");
const Team = require("../models/Team");
const Sponsor = require("../models/Sponsor");
const Registration = require("../models/Registration");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all analytics stats
router.get("/stats", auth, role("admin"), async (req, res) => {
  try {
    const [users, tournaments, matches, teams, sponsors, registrations] = await Promise.all([
      User.countDocuments(),
      Tournament.countDocuments(),
      Match.countDocuments(),
      Team.countDocuments(),
      Sponsor.countDocuments(),
      Registration.countDocuments(),
    ]);

    // Get tournament status distribution
    const upcomingTournaments = await Tournament.countDocuments({ status: "upcoming" });
    const ongoingTournaments = await Tournament.countDocuments({ status: "ongoing" });
    const completedTournaments = await Tournament.countDocuments({ status: "completed" });

    // Get total prize pool
    const tournamentsData = await Tournament.find();
    const totalPrizePool = tournamentsData.reduce((sum, t) => sum + (t.prizePool || 0), 0);

    // Get monthly tournament data (last 12 months)
    const monthlyData = await Tournament.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyData = monthlyData.map(item => ({
      month: months[item._id.month - 1],
      count: item.count
    })).reverse();

    // Get sport distribution
    const sportDistribution = await Tournament.aggregate([
      {
        $lookup: {
          from: "sports",
          localField: "sportId",
          foreignField: "_id",
          as: "sport"
        }
      },
      { $unwind: { path: "$sport", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$sport.name", "Unknown"] },
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedSportDistribution = sportDistribution.map(item => ({
      name: item._id,
      count: item.count
    }));

    const data = {
      stats: {
        users,
        tournaments,
        matches,
        teams,
        sponsors,
        registrations,
        totalPrizePool,
        upcomingTournaments,
        ongoingTournaments,
        completedTournaments,
      },
      monthlyData: formattedMonthlyData,
      sportDistribution: formattedSportDistribution,
      statusDistribution: {
        upcoming: upcomingTournaments,
        ongoing: ongoingTournaments,
        completed: completedTournaments,
      }
    };

    res.json(data);
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get real-time updates via Socket.IO
router.get("/realtime", auth, role("admin"), async (req, res) => {
  try {
    const io = req.app.get("io");
    
    // Send initial data
    const initialData = await getAnalyticsData();
    res.json(initialData);
    
    // Set up interval for real-time updates (every 30 seconds)
    const interval = setInterval(async () => {
      const updatedData = await getAnalyticsData();
      io.emit("analytics_update", updatedData);
    }, 30000);
    
    // Clear interval when connection closes
    req.on("close", () => {
      clearInterval(interval);
    });
  } catch (err) {
    console.error("Realtime Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Helper function to get analytics data
async function getAnalyticsData() {
  const [users, tournaments, matches, teams, sponsors, registrations] = await Promise.all([
    User.countDocuments(),
    Tournament.countDocuments(),
    Match.countDocuments(),
    Team.countDocuments(),
    Sponsor.countDocuments(),
    Registration.countDocuments(),
  ]);

  const upcomingTournaments = await Tournament.countDocuments({ status: "upcoming" });
  const ongoingTournaments = await Tournament.countDocuments({ status: "ongoing" });
  const completedTournaments = await Tournament.countDocuments({ status: "completed" });

  const tournamentsData = await Tournament.find();
  const totalPrizePool = tournamentsData.reduce((sum, t) => sum + (t.prizePool || 0), 0);

  return {
    stats: {
      users,
      tournaments,
      matches,
      teams,
      sponsors,
      registrations,
      totalPrizePool,
      upcomingTournaments,
      ongoingTournaments,
      completedTournaments,
    }
  };
}

module.exports = router;