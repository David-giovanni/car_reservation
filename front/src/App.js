import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import History from "./Components/History";
import Home from "./Components/Home";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/history" element={<History />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
