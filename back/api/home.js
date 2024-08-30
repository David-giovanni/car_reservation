const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432, // Assurez-vous que le port est défini, le port par défaut de PostgreSQL est 5432
  database: process.env.PG_DATABASE,
});

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const query = `SELECT * FROM reservations;`;
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Error fetching reservations." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
