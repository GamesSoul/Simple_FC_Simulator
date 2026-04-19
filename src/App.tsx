import { HashRouter, Routes, Route } from 'react-router-dom';
import EmulatorJsPage from './pages/EmulatorJsPage';

/**
 * Root component with router configuration.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<EmulatorJsPage />} />
      </Routes>
    </HashRouter>
  );
}