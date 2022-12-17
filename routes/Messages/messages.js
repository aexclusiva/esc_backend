const router = require("express").Router();
const Message = require("../../models/MessageSystem/Message");
const Propriedade = require("../../models/Propriedade");

//Add message to conversation
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all messages in conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/lastmessage/:conversationId", async (req, res) => {
  try {
    const messages = await Message.findOne({
      conversationId: req.params.conversationId,
    })
      .sort({ createdAt: -1 })
      .limit(1);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
