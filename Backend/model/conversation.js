const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userMessage: {
    type: String,
    required: true,
  },

  aiResponse: {
    type: String,
    required: true,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    messages: [messageSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Conversation", conversationSchema);
