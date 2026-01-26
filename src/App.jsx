import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reminders from './pages/Reminders';
import Schedule from './pages/Schedule';
import Guidelines from './pages/Guidelines';

import FindYourZone from './pages/FindYourZone';
import ZoneEditor from './pages/ZoneEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Schedule />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="guidelines" element={<Guidelines />} />
          <Route path="find-zone" element={<FindYourZone />} />
        </Route>
        <Route path="/zone-editor" element={<ZoneEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
