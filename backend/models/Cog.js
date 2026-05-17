const mongoose = require("mongoose");

const cogSchema = new mongoose.Schema(
  {
    name:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
  }
);

module.exports = mongoose.model("Cog", cogSchema);


