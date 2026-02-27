import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { FilmesPage } from './pages/FilmesPage';
import { SessoesPage } from './pages/SessoesPage';
import { NovaReservaPage } from './pages/NovaReservaPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#080812',
        fontFamily: '"DM Sans", "Segoe UI", sans-serif',
      }}>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/filmes" element={<FilmesPage />} />
            <Route path="/sessoes" element={<SessoesPage />} />
            <Route path="/reservas/nova" element={<NovaReservaPage />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </BrowserRouter>
  );
}
