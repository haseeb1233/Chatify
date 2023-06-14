const express = require("express");
const aunthenticate = require("../middlewares/aunthenticate");
const Chat = require("../models/chat.modal");
const router = express.Router();
const User = require("../models/user.model");

// Create or fetch One to One Chat


router.post("/new", aunthenticate, async (req, res) => {
  const { userId } = req.body;
  const reqUser = await req.user;
  if (!userId) {
    console.log("provide a userId");
    return res.status(400).send({ message: "please provide userId" });
  }
  console.log("req user", reqUser.user._id);

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: reqUser.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [reqUser.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      console.log("fullChat", FullChat);
      return res.status(200).send(FullChat);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }
});



router.get("/getall", aunthenticate, async (req, res) => {
  try {
    const reqUser = await req.user;
    const newChat = await Chat.find({ users: reqUser.user._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    return res.send(newChat);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});


router.post("/creategroup", aunthenticate, async (req, res) => {
  let { users, chatName } = req.body;
  const reqUser = await req.user;
  if (!users || !chatName)
    return res.status(400).send({ message: "All filds are require" });

  users.push(reqUser.user._id);

  if (users.length < 2)
    return res
      .status(401)
      .send({ message: "min two users required for group chat" });

  try {
    const groupChat = await Chat.create({
      chatName,
      users,
      groupAdmin: reqUser.user._id,
      isGroupChat: true,
    });

    const fullChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).send(fullChat);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});


router.put("/renamegroup", aunthenticate, async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat)
    return res.status(400).send({ message: "chat is not found" });

  return res.status(201).send(updatedChat);
});

router.put("/addtogroup", aunthenticate, async (req, res) => {
  const { chatId, userId } = req.body;

  const addToGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addToGroup)
    return res.status(400).send({ message: "chat is not found" });

  return res.status(201).send(addToGroup);
});


router.put("/removefromgroup", aunthenticate, async (req, res) => {
  const { chatId, userId } = req.body;

  const removeFromGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removeFromGroup)
    return res.status(400).send({ message: "chat is not found" });

  return res.status(201).send(removeFromGroup);
});

module.exports = router;
