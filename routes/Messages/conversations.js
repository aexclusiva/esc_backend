const router = require("express").Router();
const Conversation = require("../../models/MessageSystem/Conversation");

//Start New Conversation
router.post("/", async (req, res) => {
  console.log("Started bew conversation");
  const newConversation = new Conversation({
    propriedadeID: req.body.propriedadeID,
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get Conversation by id
router.get("/:id", async (req, res) => {
  console.log("trig");
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


//get Conversation by Userid
router.get("/user/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
