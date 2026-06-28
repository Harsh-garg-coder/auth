import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const query = async (text, params) => {
    return pool.query(text, params)
}

export { query };