require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./config/db");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const documentRouter = require("./routes/documentRoutes");
const adminRouter = require("./routes/adminRoutes");
const leaderboardRouter = require("./routes/leaderboardRoutes");
const documentToolsRouter = require("./routes/documentToolsRoutes");
const bookRouter = require("./routes/booksRouter");
const { updateUserStatus } = require("./controllers/userController");
const http = require("http");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/documents", documentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tools", documentToolsRouter);
app.use("/api/books", bookRouter);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    await updateUserStatus(userId, true);
    await socket.emit("status", { message: "User is online" });
  }

  socket.on("disconnect", async () => {
    if (userId) {
      await updateUserStatus(userId, false);
    }
  });
});

const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
  });
});
