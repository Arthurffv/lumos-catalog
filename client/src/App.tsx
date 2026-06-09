import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar       from './components/Navbar';
import GamesPage    from './pages/GamesPage';
import GameFormPage from './pages/GameFormPage';
import DevelopersPage from './pages/DevelopersPage';
import PublishersPage from './pages/PublishersPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/"              element={<Navigate to="/games" replace />} />
          <Route path="/games"         element={<GamesPage />} />
          <Route path="/games/new"     element={<GameFormPage />} />
          <Route path="/games/:id/edit" element={<GameFormPage />} />
          <Route path="/developers"   element={<DevelopersPage />} />
          <Route path="/publishers"   element={<PublishersPage />} />
        </Routes>
      </main>
    </>
  );
}
