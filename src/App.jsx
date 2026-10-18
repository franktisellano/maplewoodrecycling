import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Reminders from './pages/Reminders';
import Schedule from './pages/Schedule';
import Guidelines from './pages/Guidelines';

import FindYourZone from './pages/FindYourZone';
import ZoneEditor from './pages/ZoneEditor';
import { pageViewed } from './utils/analytics';

// One "page viewed" each time the address changes, so moving between pages counts like a visit to each.
function PageViews() {
  const { pathname } = useLocation();
  useEffect(() => { pageViewed(pathname); }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <PageViews />
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
