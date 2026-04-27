const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database");
const { userRouter } = require("./routes/user");
const PORT = process.env.PORT || 5000;
const app = express();

//middlewares
app.use(express.json());

app.use("/api/user", userRouter);

connectDB()
  .then(() => {
    console.log("DB connected successfully!");
    app.listen(PORT, () =>
      console.log(`App is running successfully on port ${PORT}`),
    );
  })
  .catch((err) => console.error("DB Error: ", err));
