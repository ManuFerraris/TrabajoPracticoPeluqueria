import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PeluqueroPage from "./pages/peluquero/Peluqueropage.js";
import LocalidadesPage from "./pages/localidad/Localidad.page.js";
import TipoServicioPage from "./pages/tipoServicio/Tiposervicio.page.js";
import ServiciosPage from "./pages/servicio/Servicio.page.js";
import TurnosPage from "./pages/turno/Turno.page.js";
import MenuPage from './pages/MenuPage';

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

            </Routes>
        </Router>
    );
}

export default App;