import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import setitec from "../Assets/setitec.png";
import { Tooltip } from "antd";
import ReservationCalendar from "./ReservationCalendar";

function Home() {
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [reservations, setReservations] = useState([]);
  const [reservationMessage, setReservationMessage] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [reservedTimeSlots, setReservedTimeSlots] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionHistory, setActionHistory] = useState(() => {
    const savedHistory = localStorage.getItem("actionHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCarChange = (event) => {
    setSelectedCar(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setSelectedStartDate(event.target.value);
    console.log("Selected Start Date:", event.target.value);
  };

  const handleStartTimeChange = (event) => {
    setSelectedStartTime(event.target.value);
    console.log("Selected Start Time:", event.target.value);
  };

  const handleEndDateChange = (event) => {
    setSelectedEndDate(event.target.value);
    console.log("Selected End Date:", event.target.value);
  };

  const handleEndTimeChange = (event) => {
    setSelectedEndTime(event.target.value);
    console.log("Selected End Time:", event.target.value);
  };

  const handleReservation = async () => {
    if (
      selectedCar &&
      selectedStartDate &&
      selectedStartTime &&
      selectedEndDate &&
      selectedEndTime &&
      selectedName &&
      selectedPurpose &&
      selectedCode
    ) {
      const start_date = new Date(`${selectedStartDate}T${selectedStartTime}`);
      const end_date = new Date(`${selectedEndDate}T${selectedEndTime}`);

      // Check if end date is after start date
      if (end_date <= start_date) {
        setReservationMessage(
          "⚠️ La date et l'heure de début doivent être avant celles de fin ⚠️"
        );
        return;
      }

      const newReservation = {
        car: selectedCar,
        start_date: start_date,
        end_date: end_date,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
        name: selectedName,
        purpose: selectedPurpose,
        code: selectedCode,
      };

      console.log("New Reservation:", newReservation);

      const overlappingReservation = reservations.find((reservation) => {
        const existingStartDate = new Date(reservation.start_date);
        const existingEndDate = new Date(reservation.end_date);

        // Vérifiez si la voiture sélectionnée est la même que celle de la réservation existante
        if (reservation.car !== selectedCar) {
          return false;
        }

        // Convertir les dates et heures en objets Date
        const newReservationStart = new Date(
          `${selectedStartDate}T${selectedStartTime}`
        );
        const newReservationEnd = new Date(
          `${selectedEndDate}T${selectedEndTime}`
        );

        // Vérifier les chevauchements en comparant les plages horaires
        return (
          (newReservationStart >= existingStartDate &&
            newReservationStart < existingEndDate) ||
          (newReservationEnd > existingStartDate &&
            newReservationEnd <= existingEndDate) ||
          (newReservationStart <= existingStartDate &&
            newReservationEnd >= existingEndDate)
        );
      });

      if (overlappingReservation) {
        setReservationMessage(
          "⚠️ La voiture est réservée pour cette date, choisissez une autre ⚠️"
        );
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:4000/home",
          newReservation
        );
        const insertedReservation = response.data;

        const reservationAction = `${format(
          new Date(),
          "dd/MM/yyyy HH:mm:ss"
        )} : ${selectedName} a reservé la ${selectedCar} pour la date ${start_date.toLocaleString()} au ${end_date.toLocaleString()} dans le but de ${selectedPurpose}`;

        const updatedHistory = [...actionHistory, reservationAction];
        setActionHistory(updatedHistory);

        // Sauvegarder l'historique dans le localStorage
        localStorage.setItem("actionHistory", JSON.stringify(updatedHistory));

        setReservations([...reservations, insertedReservation]);
        setReservedTimeSlots([...reservedTimeSlots, insertedReservation]);

        // Clear form fields and show success message
        setSelectedCar("");
        setSelectedStartDate("");
        setSelectedStartTime("");
        setSelectedEndDate("");
        setSelectedEndTime("");
        setSelectedName("");
        setSelectedPurpose("");
        setReservationMessage(
          `<span style="color: green;">Reservation Made ✅`
        );
      } catch (error) {
        console.error(error);
        setReservationMessage("Error making reservation.");
      }
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get("http://localhost:4000/home");
        const fetchedReservations = response.data;

        // Remove expired reservations
        const updatedReservations = fetchedReservations.filter(
          (reservation) => {
            const endDate = new Date(reservation.end_date);
            const currentDate = new Date();
            return endDate >= currentDate;
          }
        );

        setReservations(updatedReservations);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch reservations on initial load
    fetchReservations();

    // Fetch reservations periodically (adjust the interval as needed)
    const intervalId = setInterval(fetchReservations, 60000); // 1 minute

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  const handleDeleteReservation = async (reservationId) => {
    const shouldDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette réservation ?"
    );
    if (shouldDelete) {
      // Demander le code secret de l'utilisateur
      const enteredCode = prompt("Entrez votre code secret :");

      // Vérifier si le code secret correspond à celle de la réservation
      const reservationToDelete = reservations.find(
        (reservation) => reservation.id === reservationId
      );

      if (!reservationToDelete) {
        console.error("Reservation not found.");
        return;
      }

      if (enteredCode === reservationToDelete.code) {
        try {
          const startTime = new Date(reservationToDelete.start_date);
          const endTime = new Date(reservationToDelete.end_date);

          await axios.delete(`http://localhost:4000/home/${reservationId}`);

          // Mettez à jour la liste des réservations en supprimant la réservation supprimée
          const updatedReservations = reservations.filter(
            (reservation) => reservation.id !== reservationId
          );

          const deleteAction = `${format(
            new Date(),
            "dd/MM/yyyy HH:mm:ss"
          )} : ${
            reservationToDelete.name
          } a supprimé la réservation pour la date ${startTime.toLocaleString()} au ${endTime.toLocaleString()} dans le but de ${
            reservationToDelete.purpose
          }`;

          const updatedHistory = [...actionHistory, deleteAction];
          setActionHistory(updatedHistory);

          // Sauvegarder l'historique dans le localStorage
          localStorage.setItem("actionHistory", JSON.stringify(updatedHistory));

          setReservations(updatedReservations);
        } catch (error) {
          console.error(error);
          setReservationMessage("Error deleting reservation.");
        }
      } else {
        alert(
          "Code secret incorrect. La suppression de la réservation a échoué."
        );
      }
    }
  };

  return (
    <div className="bg-[#242424] px-10 py-10 min-h-screen">
      <h2 className="text-4xl dark:text-white font-bold text-center pb-5">
        <div className="flex justify-center">
          <a href="history">
            <img className="w-80 h-full justify-center" src={setitec} alt="" />
          </a>
        </div>
      </h2>
      <div className="text-white text-center text-xl font-bold pb-5">
        RESERVATION VOITURES
      </div>
      <div className="flex justify-center gap-20">
        <div className="">
          {/* Card avec information pour effectuer la reservation */}
          <div className="relative bg-[#161616] p-8 rounded-3xl mx-auto max-w-[400px] w-full grid grid-cols-2 gap-2 mt-5">
            <select
              className="col-span-2 rounded-lg bg-gray-400 mt-2 p-2 focus:bg-gray-300 focus:outline-none text-black font-bold"
              onChange={handleCarChange}
              value={selectedCar}
            >
              <option value="">Choisir une voiture</option>
              <option value="3008 Auto Blanche">3008 Auto Blanche</option>
              <option value="3008 Manuelle Noir">3008 Manuelle Noir</option>
            </select>
            <div className="col-span-2 flex flex-col py-2">
              <select
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none font-bold"
                onChange={(e) => setSelectedName(e.target.value)}
                value={selectedName}
              >
                <option value="">Sélectionnez un nom</option>
                <option value="Amélie Adet">Amélie Adet</option>
                <option value="Benjamin Martinon">Benjamin Martinon</option>
                <option value="Benoit Coumes">Benoit Coumes</option>
                <option value="Chloé Marechal">Chloé Marechal</option>
                <option value="Christophe Rouxel">Christophe Rouxel</option>
                <option value="Dimittri Pankratov">Dimittri Pankratov</option>
                <option value="Elisabeth Chapotelle">
                  Elisabeth Chapotelle
                </option>
                <option value="Etienne Luneau">Etienne Luneau</option>
                <option value="Etienne Petit">Etienne Petit</option>
                <option value="Fabien Gerasse">Fabien Gerasse</option>
                <option value="Franck Boudier">Franck Boudier</option>
                <option value="Gaëlle Beigeaud">Gaëlle Beigeaud</option>
                <option value="Julien Bruno">Julien Bruno</option>
                <option value="Mikael Maurel">Mikael Maurel</option>
                <option value="Mikhail Chudnovskiy">Mikhail Chudnovskiy</option>
                <option value="Olivier Cresson">Olivier Cresson</option>
                <option value="Sabrina Lecuyot">Sabrina Lecuyot</option>
                <option value="Sabrina Roux">Sabrina Roux</option>
                <option value="Sébastien Goudin">Sébastien Gourdin</option>
                <option value="Thomas Hurvy">Thomas Hurvy</option>
                <option value="Yann Aimon">Yann Aimon</option>
              </select>
              <input
                type="text"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none"
                onChange={(e) => setSelectedName(e.target.value)}
                onFocus={(e) => {
                  if (
                    e.target.value ===
                    "Saisissez votre nom ici si non répertorié."
                  )
                    e.target.value = "";
                }}
                onBlur={(e) => {
                  if (e.target.value === "")
                    e.target.value =
                      "Saisissez votre nom ici si non répertorié.";
                }}
                value={
                  selectedName === ""
                    ? "Saisissez votre nom ici si non répertorié."
                    : selectedName
                }
              />
            </div>

            <div className="col-span-1 flex flex-col py-2">
              <label className="text-white font-bold">Motif</label>
              <input
                type="text"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none"
                placeholder="Motif"
                onChange={(e) => setSelectedPurpose(e.target.value)}
                value={selectedPurpose}
              />
            </div>
            <div className="col-span-1 flex flex-col py-2">
              <Tooltip title="Le code secret vous permettra de pouvoir supprimer la réservation par la suite, veillez à le retenir !">
                <span className="text-white font-bold">Code Secret *</span>
              </Tooltip>
              <input
                type="text"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none"
                placeholder="Code"
                onChange={(e) => setSelectedCode(e.target.value)}
                value={selectedCode}
              />
            </div>
            <div className="col-span-1 flex flex-col py-2">
              <label className="text-white font-bold">Date de début</label>
              <input
                type="date"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none"
                onChange={handleStartDateChange}
                value={selectedStartDate}
              />
            </div>
            <div className="col-span-1 flex flex-col py-2">
              <label className="text-white font-bold">Heure de début</label>
              <input
                type="time"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none"
                onChange={handleStartTimeChange}
                value={selectedStartTime}
              />
            </div>
            <div className="col-span-1 flex flex-col py-2">
              <label className="text-white font-bold">Date de fin</label>
              <input
                type="date"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:bg-gray-300 focus:outline-none"
                onChange={handleEndDateChange}
                value={selectedEndDate}
              />
            </div>
            <div className="col-span-1 flex flex-col py-2">
              <label className="text-white font-bold">Heure de fin</label>
              <input
                type="time"
                className="p-2 rounded-lg bg-gray-400 mt-2 focus:border-blue-500 focus:bg-gray-300 focus:outline-none"
                onChange={handleEndTimeChange}
                value={selectedEndTime}
              />
            </div>
            <button
              onClick={handleReservation}
              className="bg-black col-span-2 items-center text-gray-400 border border-[#0A5192] font-medium py-2 my-1 rounded-xl hover:text-white"
            >
              Réserver
            </button>
          </div>
        </div>
        {/* Fin : Card avec information pour effectuer la reservation */}

        <div className="justify-center items-center">
          {/* lien vers la page "ReservationCalendar.js" */}
          <ReservationCalendar reservations={reservations} />
          {/* Fin : lien vers la page "ReservationCalendar.js" */}

          {/* Message pour Reservation effectuer ou pas */}
          <div className="mt-4">
            {reservationMessage && (
              <p
                className="text-red-500 text-center text-2xl"
                dangerouslySetInnerHTML={{ __html: reservationMessage }}
              />
            )}
          </div>
          {/* Fin : Message pour Reservation effectuer ou pas  */}
        </div>
      </div>

      {/* Barre de filtration */}
      <div className="px-20 pt-9">
        <input
          type="text"
          className="bg-gray-400 p-2 rounded-xl w-full placeholder:text-black focus:outline-none"
          placeholder="Filtrer les réservations..."
          onChange={handleSearchChange}
          value={searchQuery}
        />
      </div>
      {/* Fin : Barre de filtration */}

      <div className="mt-4">
        <div className="flex flex-wrap">
          {reservations
            // Inclure dans le filtre : Nom, Prenom etc...
            .filter((reservation) =>
              Object.values(reservation).some(
                (value) =>
                  (typeof value === "string" || typeof value === "number") &&
                  value
                    .toString()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
            )
            // Fin : Inclure dans le filtre : Nom, Prenom etc...

            .map((reservation, index) => {
              const startDate = reservation.start_date
                ? new Date(reservation.start_date)
                : null;
              const endDate = reservation.end_date
                ? new Date(reservation.end_date)
                : null;
              const startYear = startDate ? startDate.getFullYear() : "N/A";
              const startMonth = startDate
                ? `0${startDate.getMonth() + 1}`.slice(-2)
                : "N/A";
              const startDay = startDate
                ? `0${startDate.getDate()}`.slice(-2)
                : "N/A";

              const endYear = endDate ? endDate.getFullYear() : "N/A";
              const endMonth = endDate
                ? `0${endDate.getMonth() + 1}`.slice(-2)
                : "N/A";
              const endDay = endDate
                ? `0${endDate.getDate()}`.slice(-2)
                : "N/A";

              return (
                //  Afficher les reservations
                <div className="px-3 flex">
                  <div
                    key={index}
                    className="bg-[#161616] text-white p-4 m-1 rounded-3xl transition-transform transform hover:scale-105 border border-[#0A5192] border-x-2 border-y-2"
                  >
                    <p>
                      <span className="font-bold text-white">
                        Réservation :
                      </span>{" "}
                      {reservation.car}
                    </p>
                    <p className="text-green-200">
                      <span className="font-bold text-white">
                        Date de début :
                      </span>{" "}
                      {startDate
                        ? `${startDay}/${startMonth}/${startYear}`
                        : "N/A"}
                    </p>
                    <p className="text-red-200">
                      <span className="font-bold text-white">
                        Heure de début :
                      </span>{" "}
                      {reservation.start_time ? reservation.start_time : "N/A"}
                    </p>
                    <p className="text-green-200">
                      <span className="font-bold text-white">
                        Date de fin :
                      </span>{" "}
                      {endDate ? `${endDay}/${endMonth}/${endYear}` : "N/A"}
                    </p>
                    <p className="text-red-200">
                      <span className="font-bold text-white">
                        Heure de fin :
                      </span>{" "}
                      {reservation.end_time ? reservation.end_time : "N/A"}
                    </p>
                    <p>
                      <span className="font-bold">Motif :</span>{" "}
                      {reservation.purpose ? reservation.purpose : "N/A"}
                    </p>
                    <p>
                      <span className="font-bold">Par :</span>{" "}
                      {reservation.name}
                    </p>
                  </div>

                  <button
                    className="bg-red-500 text-white w-11 m-1 rounded-xl transition-transform transform hover:scale-105"
                    onClick={() => handleDeleteReservation(reservation.id)}
                  >
                    Supp
                  </button>
                </div>
                // Fin : Afficher les reservations
              );
            })}
        </div>
      </div>
      <div className="flex justify-center"></div>
    </div>
  );
}

export default Home;
