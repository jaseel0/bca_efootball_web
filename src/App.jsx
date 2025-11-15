// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Pages/Home';
import League from './components/Pages/League';
import Players from './components/Pages/Players';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/league" element={<League />} />
          <Route path="/players" element={<Players />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;