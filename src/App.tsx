import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import AdventureMap from './pages/AdventureMap';
import IdentifyEmotion from './pages/IdentifyEmotion';
import CorrectAnswer from './pages/CorrectAnswer';
import IncorrectAnswer from './pages/IncorrectAnswer';
import BreathingExercise from './pages/BreathingExercise';
import LevelCompleted from './pages/LevelCompleted';
import Achievements from './pages/Achievements';
import Accessibility from './pages/Accessibility';

const TITLES: [RegExp, string][] = [
  [/^\/inicio/, 'Inicio'],
  [/^\/mapa/, 'Mapa de la aventura'],
  [/^\/actividad\/identificar/, '¿Cómo se siente?'],
  [/^\/actividad\/correcta/, '¡Muy bien!'],
  [/^\/actividad\/pista/, 'Una pista de Tico'],
  [/^\/actividad\/respirar/, 'Respira conmigo'],
  [/^\/nivel-completado/, '¡Nivel superado!'],
  [/^\/logros/, 'Mis logros'],
  [/^\/accesibilidad/, 'Accesibilidad'],
];

/** Título de la pestaña y desplazamiento arriba al cambiar de pantalla. */
function RouteEffects() {
  const { pathname } = useLocation();
  const section = pathname.startsWith('/actividad/respirar') ? '/actividad/respirar' : pathname;

  useEffect(() => {
    const match = TITLES.find(([re]) => re.test(pathname));
    document.title = match ? `${match[1]} · Sincero` : 'Sincero';
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [section]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Dashboard />} />
        <Route path="/mapa" element={<AdventureMap />} />
        <Route path="/actividad/identificar" element={<IdentifyEmotion />} />
        <Route path="/actividad/correcta" element={<CorrectAnswer />} />
        <Route path="/actividad/pista" element={<IncorrectAnswer />} />
        {/* Inhalar y exhalar comparten la misma sesión de respiración */}
        <Route path="/actividad/respirar" element={<BreathingExercise />}>
          <Route index element={null} />
          <Route path="exhalar" element={null} />
        </Route>
        <Route path="/nivel-completado" element={<LevelCompleted />} />
        <Route path="/logros" element={<Achievements />} />
        <Route path="/accesibilidad" element={<Accessibility />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </AppProvider>
  );
}
