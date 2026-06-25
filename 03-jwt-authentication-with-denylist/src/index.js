import "dotenv/config";
import express from "express";
import authRouter from "./auth/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

// listen
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server is listening on PORT: ", PORT);
})