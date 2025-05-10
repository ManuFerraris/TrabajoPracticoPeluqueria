import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PeluqueroPage from "./pages/peluquero/Peluqueropage.js";
import LocalidadesPage from "./pages/localidad/Localidad.page.js";
import TipoServicioPage from "./pages/tipoServicio/Tiposervicio.page.js";
import ServiciosPage from "./pages/servicio/Servicio.page.js";
import TurnosPage from "./pages/turno/Turno.page.js";
import MenuPage from './pages/MenuPage';
import ClientesPage from "./pages/cliente/Cliente.page.js";
import Buscadorpage from "./pages/buscador/buscador.page.js";
import HistorialPeluqueroPage from './pages/historialPeluquero/HistorialPeluqueroPage';
import HistorialClientePage from './pages/historialCliente/HistorialClientePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/peluquero" element={<PeluqueroPage />} />
                <Route path="/localidad" element={<LocalidadesPage />} />
                <Route path="/tiposervicio" element={<TipoServicioPage />} />
                <Route path= "/servicio" element={<ServiciosPage/>} />
                <Route path= "/turno" element={<TurnosPage/>} />
                <Route path= "/cliente" element={<ClientesPage/>} />
                <Route path= "/buscador" element={<Buscadorpage/>} />
                <Route path="/historial-peluquero" element={<HistorialPeluqueroPage />} />
                <Route path="/historial-cliente" element={<HistorialClientePage />} />
            </Routes>
        </Router>
    );
}

export default App;