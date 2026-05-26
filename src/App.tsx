import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <DataProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player/:name" element={<PlayerPage />} />
        </Routes>
      </DataProvider>
    </HashRouter>
  );
}
