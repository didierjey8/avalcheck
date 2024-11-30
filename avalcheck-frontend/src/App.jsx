import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WagmiExample from './Pages/WagmiExample';
import Home from './Pages/Home';
import LearnAndEarn from './Pages/LearnAndEarn';
import GetCertified from './Pages/GetCertified';
import GetCertifiedQuestions from './Pages/GetCertifiedQuestions';
import ViewTransaction from './Pages/ViewTransaction';
import CreateTransaction from './Pages/CreateTransaction';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/WagmiExample" element={<WagmiExample />}></Route>
        <Route path="/LearnAndEarn" element={<LearnAndEarn />}></Route>
        <Route path="/GetCertified" element={<GetCertified />}></Route>
        <Route
          path="/GetCertifiedQuestions"
          element={<GetCertifiedQuestions />}
        ></Route>
        <Route path="/ViewTransaction" element={<ViewTransaction />}></Route>
        <Route path="/CreateTransaction" element={<CreateTransaction />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
