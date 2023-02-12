const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json({ message: err });
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated.");
    } catch (e) {
      return res.status(500).json({ message: e });
    }
  } else {
    return res
      .status(500)
      .json({ message: "You can only update your own account." });
  }
});

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted.");
    } catch (e) {
      return res.status(500).json({ message: e });
    }
  } else {
    return res
      .status(500)
      .json({ message: "You can only delete your own account." });
  }
});

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({
          username: username,
        });

    const { password, createdAt, updatedAt, __v, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (e) {
    res.status(500).json(e);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });

        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const friends = await Promise.all(
      user.followings.map((id) => {
        return User.findById(id);
      })
    );

    let friendList = []

    friends.map(friend => {

      const {_id,username,profilePic} = friend



      friendList.push({_id,username,profilePic})
    } )

    res.status(200).json(friendList)




  } catch (e) {
    res.status(500).json(e);
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });

        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("you allready unfollow this user");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
