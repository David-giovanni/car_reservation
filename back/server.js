const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const app = express();

app.use(express.json());
app.use(cors());

app.get("/home", async (req, res) => {
  try {
    const query = `
      SELECT * FROM reservations;`;

    const result = await pool.query(query);
    const reservations = result.rows;

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching reservations." });
  }
});

app.post("/home", async (req, res) => {
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

    // Enregistrez l'action dans l'historique
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
});

app.delete("/home/:id", async (req, res) => {
  const reservationId = req.params.id;

  try {
    // Mettre à jour l'enregistrement dans la table reservation_history pour supprimer la référence
    const updateHistoryQuery = `
      UPDATE reservation_history
      SET reservation_id = NULL
      WHERE reservation_id = $1;`;

    await pool.query(updateHistoryQuery, [reservationId]);

    // Ensuite, supprimer l'enregistrement dans la table reservations
    const deleteReservationQuery = `
      DELETE FROM reservations
      WHERE id = $1;`;

    await pool.query(deleteReservationQuery, [reservationId]);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting reservation." });
  }
});

app.listen(4000, () => console.log("Server on localhost:4000"));
