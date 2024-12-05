require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./config/db");
const router = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", router);

const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`); 
  });
});
