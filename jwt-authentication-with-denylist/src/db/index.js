import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DB_URL,
});

const query = (text, params) => {
    return pool.query(text, params);
}

export { query };