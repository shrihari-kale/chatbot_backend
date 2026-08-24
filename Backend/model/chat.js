const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        userMessage: {
            type:String,
            required: true,
        },
        aiResponse: {
            type:String,
            required: true,
        },
      },
      {
        timestamps: true,
      }
);

module.exports = mongoose.model("chat",chatSchema)