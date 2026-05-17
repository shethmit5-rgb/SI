const express = require("express");
const Venue = require("../models/venue");
const router = express.Router();

router.post("/", async (req, res) => {
  const venue = new Venue(req.body);
  await venue.save();
  res.json({ message: "Venue created", venue });
});

router.get("/", async (req, res) => {
  const venues = await Venue.find();
  res.json(venues);
});

router.put("/:id", async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Venue updated", venue });
});

router.delete("/:id", async (req, res) => {
  await Venue.findByIdAndDelete(req.params.id);
  res.json({ message: "Venue deleted" });
});

module.exports = router;
