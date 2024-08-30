const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "gio",
  host: "localhost",
  port: 5432,
  database: "test",
});

module.exports = async (req, res) => {
  if (req.method === "DELETE") {
    const reservationId = req.query.id;

    try {
      const updateHistoryQuery = `
        UPDATE reservation_history
        SET reservation_id = NULL
        WHERE reservation_id = $1;`;

      await pool.query(updateHistoryQuery, [reservationId]);

      const deleteReservationQuery = `
        DELETE FROM reservations
        WHERE id = $1;`;

      await pool.query(deleteReservationQuery, [reservationId]);

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting reservation." });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
