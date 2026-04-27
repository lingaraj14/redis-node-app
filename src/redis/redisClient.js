const { createClient } = require("redis");

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-10364.crce276.ap-south-1-3.ec2.cloud.redislabs.com",
    port: 10364,
  },
});

//To check if any error duing the connection
redisClient.on("error", (err) => console.error("Redis client error: ", err));

//Check if connecting
redisClient.on("connect", () => console.log("Redis is connecting..."));

//check if connection is ready
redisClient.on("ready", () => console.log("Redis connected successfully!"));

redisClient.connect();

module.exports = redisClient;
