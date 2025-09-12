import { useNavigate, useLocation, Outlet } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from "../auth/AuthProvider.tsx";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../index.css";

function ClienteLayout(){
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const user = auth.user;
    const isHome = location.pathname === "/clientes/homeCliente";

    const handleLogout = () => {
        auth.logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Navbar fija arriba */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
                <div className="container-fluid">
                
                <button
                    onClick={() => navigate("/clientes/homeCliente")}
                    className="navbar-brand btn btn-link text-white text-decoration-none"
                >
                    Peluquería App
                </button>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <i className="bi bi-list fs-3 text-white"></i>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav ms-auto">

                        {/* Acciones contextuales en el menú hamburguesa */}
                        <li className="nav-item">
                            <button onClick={() => navigate("/clientes/sacar-turno")} className="btn btn-link nav-link text-white">
                                <i className="bi bi-star me-1"></i> Sacar Turno
                            </button>
                        </li>
                        <li className="nav-item">
                            <button onClick={() => navigate("/clientes/historial-cliente")} className="btn btn-link nav-link text-white">
                                <i className="bi bi-clock-history me-1"></i> Mi historial
                            </button>
                        </li>
                        <li className="nav-item">
                            <button onClick={() => navigate("/clientes/baja-turno")} className="btn btn-link nav-link text-white">
                                <i className="bi bi-calendar me-1"></i> Cancelar Turno
                            </button>
                        </li>
                        
                        {/* Acciones siempre visibles */}
                        <li className="nav-item">
                            <button onClick={() => navigate("/clientes/editar-perfil-cliente")} className="btn btn-link nav-link text-white">
                                <i className="bi bi-person-circle me-1"></i> {user?.nombre || "Perfil"}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button onClick={handleLogout} className="btn btn-link nav-link text-white">
                                <i className="bi bi-box-arrow-right me-1"></i> Salir
                            </button>
                        </li>
                    </ul>
                </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <div className="container py-4">
                {!isHome && (
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-3">
                    <i className="bi bi-arrow-left"></i> Volver
                </button>
                )}
                <Outlet />
            </div>
        </div>
    );
};

export default ClienteLayout;