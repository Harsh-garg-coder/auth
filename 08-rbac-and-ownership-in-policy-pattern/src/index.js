import "dotenv/config";
import express from "express";
import authRouter from "./features/auth/auth.routes.js";
import cookieParser from "cookie-parser";
import postRouter from "./features/posts/post.routes.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

// error handler
app.use((err, req, res, next) => {
    res.status(500).json({
        error: err.message
    });
});

// listen
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("server is listening on PORT: ", PORT);
});