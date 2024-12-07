require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./config/db");
const userRouter = require("./routes/userRoutes");
const documentRouter = require("./routes/documentRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/user", userRouter);
app.use("/api/documents", documentRouter);

const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
  });
});
