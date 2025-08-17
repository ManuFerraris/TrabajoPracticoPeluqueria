import { useState } from "react";
import { Link } from "react-router-dom";

export const PeluqueroMenu = () => {
    const [open, setOpen] = useState<boolean>(false);

    return(
        <nav className="menu-container">
            <button onClick={ ()=> setOpen(!open)} className="hamburger-btn">
                ☰ Menu
            </button>

            {open && (
                <ul className="menu-list">
                    <li><Link to="/peluqueros/historial-peluquero">Historial Peluqueros</Link></li>
                    <li><Link to="/peluqueros/top-peluqueros">Top Peluqueros</Link></li>
                    <li><Link to="/peluqueros/listado-turnos">Listado Turnos</Link></li>
                </ul>
            )}
        </nav>
    )
};