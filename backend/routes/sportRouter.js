const express = require("express");
const Sport = require("../models/sport");
const router = express.Router();

router.post("/", async (req, res) => {
  const sport = new Sport(req.body);
  await sport.save();
  res.json({ message: "Sport created", sport });
});

router.get("/", async (req, res) => {
  const sports = await Sport.find();
  res.json(sports);
});

router.put("/:id", async (req, res) => {
  const sport = await Sport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Sport updated", sport });
});

router.delete("/:id", async (req, res) => {
  await Sport.findByIdAndDelete(req.params.id);
  res.json({ message: "Sport deleted" });
});

module.exports = router;
