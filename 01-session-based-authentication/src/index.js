import "dotenv/config";
import express from "express";
import authRouter from "./auth/auth.routes.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./db/redis.js";

const app = express();

const isDevMode = process.env.NODE_ENVIRONMENT === "dev";

// middlewared
app.use(express.json());

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, 
        secure: !isDevMode, 
        sameSite: "lax", 
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

// routes
app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on PORT: ${port}`)
});
