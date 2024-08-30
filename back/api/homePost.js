const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432, // Assurez-vous que le port est défini, le port par défaut de PostgreSQL est 5432
  database: process.env.PG_DATABASE,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const {
      car,
      start_date,
      end_date,
      start_time,
      end_time,
      name,
      purpose,
      code,
    } = req.body;

    try {
      const queryReservation = `
        INSERT INTO reservations (car, start_date, end_date, start_time, end_time, name, purpose, code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;`;

      const valuesReservation = [
        car,
        start_date,
        end_date,
        start_time,
        end_time,
        name,
        purpose,
        code,
      ];

      const resultReservation = await pool.query(
        queryReservation,
        valuesReservation
      );
      const insertedReservation = resultReservation.rows[0];

      const queryHistory = `
        INSERT INTO reservation_history (reservation_id, action_description)
        VALUES ($1, $2);`;

      const valuesHistory = [
        insertedReservation.id,
        `Reservation made by ${name} for ${car} from ${start_date} ${start_time} to ${end_date} ${end_time} for the purpose of ${purpose}.`,
      ];

      await pool.query(queryHistory, valuesHistory);

      res.status(201).json(insertedReservation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error making reservation." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
