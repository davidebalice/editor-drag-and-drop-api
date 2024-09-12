const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
dotenv.config();
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const regex = /^https:\/\/(.+\.)?davidebalice\.dev$/;
  if (regex.test(origin) || /^http:\/\/localhost(:\d{1,5})?$/.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", require("./routes/designRoutes"));
app.use("/api", require("./routes/authRoutes"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./public")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./public", "index.html"));
  });
}

const dbConnect = async () => {
  try {
    if (process.env.NODE_ENV === "local") {
      await mongoose.connect(process.env.LOCAL_DB_URI);
      console.log("Local Database Is Connected..");
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Production Database Is Connected..");
    }
  } catch (error) {
    console.log("Database connection Failed.");
  }
};
dbConnect();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is runing on port ${PORT}..`));
