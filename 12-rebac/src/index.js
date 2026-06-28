import "dotenv/config";
import express from "express";
import authRouter from "./auth/auth.routes.js";
import cookieParser from "cookie-parser";
import postsRouter from "./posts/posts.routes.js";
import foldersRouter from "./folders/folders.routes.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/folders", foldersRouter);

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