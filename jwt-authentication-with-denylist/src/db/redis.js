import { createClient } from "redis";

const client = createClient({url: process.env.REDIS_URL});

client.on("error", (error) => {
    console.error("Error connecting with redis:: ", error);
});

client.on("ready", () => {
    console.log("Connected with redis!");
});

await client.connect();

const DENYLIST_PREFIX = "denylist:";

export const addToDenylist = async (jti, ttlSeconds) => {
    if (ttlSeconds <= 0) return; // token already expired, no point
    await client.set(DENYLIST_PREFIX + jti, "1", { EX: ttlSeconds });
};

export const isDenylisted = async (jti) => {
    const result = await client.get(DENYLIST_PREFIX + jti);
    return result !== null; // present = denylisted
};
