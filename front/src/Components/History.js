import React, { useState } from "react";

function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionHistory] = useState(() => {
    const savedHistory = localStorage.getItem("actionHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [filteredHistory, setFilteredHistory] = useState(actionHistory);

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);

    // Filtrer l'historique en fonction de la recherche
    const filteredActions = actionHistory.filter((action) =>
      action.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredHistory(filteredActions);
  };

  //localStorage.removeItem("actionHistory");

  return (
    <div className="bg-gradient-to-t from-black via-[#0d5293] to-black min-h-screen px-10 py-10">
      <div className="pt-10">
        <h2 className="text-2xl text-white font-bold text-center">
          FILTRER L'HISTORIQUE
        </h2>
        <input
          type="text"
          className="bg-gray-400 border border-blue-500 p-2 rounded-xl w-full mt-5"
          placeholder="Chercher parmi l'historique..."
          onChange={handleSearchChange}
          value={searchQuery}
        />
      </div>
      <div className="flex justify-center pt-10">
        <div className="max-w-[1300px] mt-4 border border-y-4 border-x-4 border-blue-500 rounded-3xl p-8">
          <h2 className="text-2xl text-white text-center font-bold">
            HISTORIQUE
          </h2>
          <ul className="pt-5">
            {filteredHistory
              .slice()
              .reverse()
              .map((action, index) => (
                <li
                  key={index}
                  className="text-white text-center p-2 mb-2 rounded-xl"
                >
                  {action}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-center pt-5">
        <button class="bg-black items-center text-gray-400 border border-blue-500 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
          <span class="bg-blue-500 shadow-blue-500 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
          <a href="/">Retour</a>
        </button>
      </div>
    </div>
  );
}

export default History;
