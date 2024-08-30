const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "gio",
  host: "localhost",
  port: 5432,
  database: "test",
});

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const query = `SELECT * FROM reservations;`;
      const result = await pool.query(query);
      const reservations = result.rows;

      res.status(200).json(reservations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching reservations." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
