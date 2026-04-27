const express = require("express");
const userModel = require("../model/user");
const redisClient = require("../redis/redisClient");

const Router = express.Router();

Router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ error: "User doesn't exist." });
    }

    const cachedUser = await redisClient.get(`user:${userId}`);
    if (cachedUser) {
      return res.json(JSON.parse(cachedUser));
    }

    const user = await userModel.findById(userId);
    await redisClient.set(`user:${userId}`, JSON.stringify(user), { EX: 60 });
    res.json(user);
  } catch (err) {
    console.error("Error: ", err);
  }
});

Router.get("/all", async (req, res) => {
  try {
    const cachedKey = "user:all";
    const cachedUsers = await redisClient.get(cachedKey);

    if (cachedUsers) {
      console.log("Comming from Redis...");
      return res.json(JSON.parse(cachedUsers));
    }

    console.log("Comming from MongoDB...");
    const users = await userModel.find({});
    await redisClient.set(cachedKey, JSON.stringify(users), { EX: 60 }); //cached data will be expire in 1min
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

Router.post("/", async (req, res) => {
  try {
    const userData = req.body;
    const userDoc = new userModel(userData);
    const savedUser = await userDoc.save();
    await redisClient.set(`user:${savedUser._id}`, JSON.stringify(savedUser), {
      EX: 60,
    });
    await redisClient.del("user:all");
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

Router.patch("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    const ALLOWED_DATA = ["firstName", "lastName", "age"];
    if (!Object.keys(data).every((el) => ALLOWED_DATA.includes(el))) {
      res.status(400).json({
        error: "Invalid inputs.",
      });
    }

    const updatedDoc = await userModel.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
    });
    await redisClient.set(`user:${userId}`, JSON.stringify(updatedDoc), {
      EX: 60,
    });
    await redisClient.del("user:all");
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

Router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({
        error: "Invalid user Id!",
      });
    }
    //delete user from redis cache
    await redisClient.del("user:all");
    await redisClient.del(`user:${userId}`);
    const deletedDoc = await userModel.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully", deletedUser: deletedDoc });
  } catch (err) {
    res.status(500).json({
      error,
    });
  }
});

module.exports = {
  userRouter: Router,
};
