const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./db");
const chat = require("./model/chat");
const Conversation = require("./model/conversation");

// mongoDB connect
const dns = require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);


dotenv.config();
connectDB();
// console.log(process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
});


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.post("/chat", async (req, res) => {
    try {
  const { message,conversationId } = req.body;
  //  console.time("AI");
  const result = await model.generateContent(message);
//  console.time("AI");
  const response = result.response.text();
  
  console.log("Message:", message);
  console.log("Response:", response);

  // console.time("DB");
  // find conversation
  const conversation = await Conversation.findById(conversationId);

  if(conversation.title === "New Chat"){
    conversation.title = message.slice(0, 30);
  }
  // add message to conversation
  conversation.messages.push({
    userMessage:message,
    aiResponse:response,
  });
  
// save conversatioin

await conversation.save();
//  console.timeEnd("DB");
console.log("Chat Saved");

  res.json({
    reply: response,
  });
  
}catch (error) {
    console.log(error);

    res.status(500).json({
        error: error.message,
        detals: error,
    });
}
});

app.get("/chats", async (req, res) => {
  try{
    const chats = await chat.find();

    res.json(chats);
  }catch (error) {
    console.log(error);

    res.status(500).json({
      error:error.message,
    });
  }
});

app.post("/conversation", async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.create({
      title: title || "New Chat",
      messages: [],
    });
   console.log(conversation);   

    res.json(conversation);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/conversations", async (req, res) => {
  try{
    const conversations = await Conversation.find().sort({ createdAt: -1 });

    res.json(conversations);
  }catch(error){
    console.log(error);

    res.status(500).json({
      error:error.message,
    });
  }
});

app.get("/conversation/:id",async (req, res) => {
  try{
    const conversation = await Conversation.findById(req.params.id);

    if(!conversation) {
      return res.status(404).json({
        error:"Conversation not found",
      });
    }
    res.json(conversation);
  }catch(error){
    console.log(error);

    res.status(500).json({
      error:error.message,
    });
  }
});

app.delete("/conversation/:id",async (req, res)=>{
  try{
    const converstion = await Conversation.findByIdAndDelete(req.params.id);

    if(!converstion){
      return res.status(404).json({
        error:"Conversation not found",
      });
    }
   res.json({
    message:"Conversation deleted",
   });
  
  }catch (error){
    console.log(error);

    res.status(500).json({
      error:error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server Started");
});
