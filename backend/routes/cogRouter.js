const express = require("express");
const Cog = require("../models/Cog");
const router = express.Router();


/* ================= CREATE USER (ADMIN ONLY) ================= */
router.post("/",async (req, res) => {
    try {
      const cog = new Cog(req.body);
      await cog.save();
      res.json({ message: "User created", cog });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


/* ================= GET ALL USERS ================= */
router.get("/cogData", async (req, res) => {
  try {
    const cog = await Cog.find();
    res.json(cog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await Cog.findById(req.params.id);

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ================= DELETE USER ================= */
router.delete("/:id", async (req, res) => {
  await Cog.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

/* ================= EDITUSER ================= */
router.put("/:id",async (req,res)=>{
  try{
    const {name,password}=req.body;
    const updateUser = await Cog.findByIdAndUpdate(
      req.params.id,
      {name,password},
      {new:true}
    );
    if(!updateUser){
      return res.status(404).json({message:"user not found"});
    }
    res.json({message:"User Updated", updateUser});
  }
  catch(error){
    console.log("user update error : ",error)
    res.status(500).json({message:"server error : ", error});
  }
})


module.exports = router;
