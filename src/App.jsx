import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reminders from './pages/Reminders';
import Schedule from './pages/Schedule';
import Guidelines from './pages/Guidelines';

// The map pages pull in Leaflet; load them only when someone opens one.
const FindYourZone = lazy(() => import('./pages/FindYourZone'));
const ZoneEditor = lazy(() => import('./pages/ZoneEditor'));
import './utils/analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Schedule />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="guidelines" element={<Guidelines />} />
          <Route path="find-zone" element={<Suspense><FindYourZone /></Suspense>} />
        </Route>
        <Route path="/zone-editor" element={<Suspense><ZoneEditor /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
