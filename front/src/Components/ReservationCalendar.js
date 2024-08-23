import React from "react";
import Calendar from "react-calendar";
import { format, eachDayOfInterval, isToday } from "date-fns";

function ReservationCalendar({ reservations }) {
  // Créez deux ensembles distincts pour les deux voitures
  const reservedDatesAutoBlanche = new Set();
  const reservedDatesManuelleNoir = new Set();

  // Parcourez les réservations pour chaque voiture et ajoutez les dates réservées aux ensembles correspondants
  reservations.forEach((reservation) => {
    const startDate = new Date(reservation.start_date);
    const endDate = new Date(reservation.end_date);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    if (reservation.car === "3008 Auto Blanche") {
      days.forEach((day) => {
        reservedDatesAutoBlanche.add(format(day, "yyyy-MM-dd"));
      });
    } else if (reservation.car === "3008 Manuelle Noir") {
      days.forEach((day) => {
        reservedDatesManuelleNoir.add(format(day, "yyyy-MM-dd"));
      });
    }
  });

  return (
    <div className="bg-[#161616] rounded-3xl p-5 mt-5">
      <h3 className="text-center rounded-xl text-white text-2xl font-bold mb-2">
        Calendrier de réservation
      </h3>
      <div className="text-white font-bold calendar mx-auto max-w-md rounded-xl p-5">
        <Calendar
          className="text-center"
          tileClassName={({ date }) => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const isTodayDate = isToday(date);
            const isPastDate = date < new Date();

            let classNames = "";

            if (
              reservedDatesAutoBlanche.has(formattedDate) &&
              reservedDatesManuelleNoir.has(formattedDate)
            ) {
              // Les deux voitures sont réservées le même jour
              classNames =
                "bg-gradient-to-r from-white via-gray-700 to-black font-bold text-white rounded-full";
            } else if (reservedDatesAutoBlanche.has(formattedDate)) {
              classNames = "bg-white font-bold text-black rounded-full";
            } else if (reservedDatesManuelleNoir.has(formattedDate)) {
              classNames = "bg-black font-bold text-white rounded-full";
            }

            if (isTodayDate) {
              classNames =
                "border border-blue-500 border-x-2 border-y-2 rounded-full";
            } else if (isPastDate) {
              // Les jours passés avant aujourd'hui sont en gris foncé
              classNames = "text-gray-500";
            }

            return classNames;
          }}
          prev2Label={null}
          prevLabel={<span>&#9664;</span>}
          next2Label={null}
          nextLabel={<span>&#9654;</span>}
        />
      </div>
      <div className="flex items-center text-white font-semibold">
        <div className="bg-white w-8 h-5 rounded-full mr-1"></div> = 3008 Auto
        Blanche
      </div>
      <div className="flex items-center text-white font-semibold">
        <div className="bg-black w-8 h-5 rounded-full mr-1"></div> = 3008
        Manuelle Noir
      </div>
      <div className="flex items-center text-white font-semibold">
        <div className="bg-gradient-to-r from-white via-gray-700 to-black w-8 h-5 rounded-full mr-1"></div>
        = 3008 Auto Blanche + 3008 Manuelle Noir
      </div>
    </div>
  );
}

export default ReservationCalendar;
