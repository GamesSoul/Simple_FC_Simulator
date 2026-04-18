import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EmulatorJsPage from './pages/EmulatorJsPage';

/**
 * Root component with router configuration.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmulatorJsPage />} />
      </Routes>
    </BrowserRouter>
  );
}