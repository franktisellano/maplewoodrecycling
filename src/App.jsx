import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reminders from './pages/Reminders';
import Schedule from './pages/Schedule';
import Guidelines from './pages/Guidelines';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Schedule />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="guidelines" element={<Guidelines />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
