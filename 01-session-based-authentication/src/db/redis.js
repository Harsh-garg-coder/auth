import { createClient } from "redis";

const client = createClient({url: process.env.REDIS_URL});

client.on("error", (error) => {
    console.error("Error connecting with redis:: ", error);
});

client.on("ready", () => {
    console.log("Connected with redis!");
});

await client.connect();

export default client;
