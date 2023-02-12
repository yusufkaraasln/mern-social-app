const router = require("express").Router();
const Conversation = require("../models/Conversation");

router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:userId", async (req, res) => {
  const conversation = await Conversation.find({
    members: { $in: [req.params.userId] },
  });

  try {
    
    res.status(200).json(conversation);

  } catch (error) {
    res.status(500).json(error);
  }

});

module.exports = router;
