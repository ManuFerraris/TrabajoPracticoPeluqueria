import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider.tsx';
import "./index.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import reportWebVitals from './reportWebVitals.js';
import PeluqueroLayout from './layout/PeluqueroLayout.tsx';
import DefaultLayout from './layout/DefaultLayout.tsx';

//Paginas publicas:
import Login from './routes/Login/Login.tsx';
import Signup from './routes/Signup/signup.tsx';
import RecoverPassword from './routes/recoverPassword.tsx';
import ResetPassword from './routes/ResetPassword/reset-password.tsx';
import PagoExitoso from './pages/Pagos/tiposRespustas/PagoExitoso.tsx';
import ErrorPage from './pages/Pagos/tiposRespustas/ErrorPage.tsx';

//Rutas privadas (CRUDS):
import PeluqueroList from './pages/peluquero/PeluqueroPage.tsx';
import ClientesPage from "./pages/cliente/Cliente.page.tsx";
import LocalidadesPage from "./pages/localidad/Localidad.page.tsx";
import TipoServicioPage from "./pages/tipoServicio/Tiposervicio.page.tsx";
import ServiciosPage from "./pages/servicio/Servicio.page.tsx";
import TurnosPage from "./pages/turno/Turno.page.tsx";
import MenuPage from './legacy/MenuPage.js';
import EditarPerfil from './routes/EditarPerfiles/EditarPerfilPeluquero.tsx';
import EditarPerfilCliente from './routes/EditarPerfiles/EditarPerfilCliente.tsx';
import PagosPage from './pages/Pagos/Pagos.tsx';

//Rutas privadas (Buscadores):
import HistorialPeluqueroPage from './pages/historialPeluquero/HistorialPeluqueroPage.tsx';
import HistorialClientePage from './pages/historialCliente/HistorialClientePage.tsx';

//Rutas privadas (no CRUDS):
import ProtectedRoute from './routes/protectedRoute.tsx';
import HomeCliente from './routes/HomeCliente/homeCliente.tsx';
import HomePeluquero from './routes/HomePeluquero/HomePeluquero.tsx';
import TopTresPeluquerosPage from './routes/topTresPeluquerosPage.tsx';
import ListadoTurnosPage from './routes/ListadoTurnosPage.tsx';
import PanelAdministracionCruds from './routes/PanelAdminCRUDs.tsx';
import ClienteLayout from './layout/ClienteLayout.tsx';
import AltaTurnoPage from './pages/AltaTurno/AltaTurnos.tsx';
import CancelarTurno from './pages/CancelarTurno.tsx';
import InformacionGerencialPage from './routes/InformacionGerencial/InfGeren.page.tsx';
import PagoEfectivo from './routes/PagoEfectivo.tsx';
import HistorialPagos from './pages/historialPagos/HistorialPagos.tsx';

const router = createBrowserRouter([

    {
      path: "/",
      element: <DefaultLayout />,
      children: [
        { path: "", element: <Navigate to="/login" replace /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
        { path: "recuperar", element: <RecoverPassword /> },
        { path: 'reset-password/:token', element: <ResetPassword /> },
        { path: "pago-exitoso", element: <PagoExitoso />, errorElement:<ErrorPage /> }
      ]
    },
    {
      path:"peluqueros",
      element: (
        <ProtectedRoute>
          <PeluqueroLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "homePeluquero", element: <HomePeluquero /> },
        { path: "historial-peluquero", element: <HistorialPeluqueroPage /> },
        { path: "top-peluqueros", element: <TopTresPeluquerosPage/>},
        { path: "listado-turnos", element: <ListadoTurnosPage/>},
        { path: "panel-admin-cruds", element: < PanelAdministracionCruds/>},
        { path: "historial-cliente", element: <HistorialClientePage /> },
        { path: "editar-perfil", element: <EditarPerfil /> },
        { path: "baja-turno", element: <CancelarTurno /> },
        { path: "peluqueroList", element: <PeluqueroList /> },
        { path: "localidades", element: <LocalidadesPage /> },
        { path: "tipoServicios", element: <TipoServicioPage /> },
        { path: "servicios", element: <ServiciosPage /> },
        { path: "turnos", element: <TurnosPage /> },
        { path: "clientesCrud", element: <ClientesPage /> },
        { path: "informacion", element: <InformacionGerencialPage /> },
        { path: "pagar-efectivo", element: <PagoEfectivo />},
        { path: "historial-pagos", element: <HistorialPagos /> }
      ]
    },
    {
      path:"clientes",
      element: (
        <ProtectedRoute>
          <ClienteLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "homeCliente", element: <HomeCliente /> },
        { path: "historial-cliente", element: <HistorialClientePage /> },
        { path: "editar-perfil-cliente", element: <EditarPerfilCliente /> },
        { path: "sacar-turno", element: <AltaTurnoPage /> },
        { path: "baja-turno", element: <CancelarTurno /> },
        { path: "pagar-turno", element: <PagosPage />},
        { path: "historial-pagos", element: <HistorialPagos /> }
      ]
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        { path: "homeCliente", element: <HomeCliente /> },
        { path: "peluqueroList", element: <PeluqueroList /> },
        { path: "localidades", element: <LocalidadesPage /> },
        { path: "tipoServicios", element: <TipoServicioPage /> },
        { path: "servicios", element: <ServiciosPage /> },
        { path: "turnos", element: <TurnosPage /> },
        { path: "clientesCrud", element: <ClientesPage /> },
        { path: "menu", element: <MenuPage /> },
        { path: "listado-turnos", element: <ListadoTurnosPage/>},
        { path: "historial-cliente", element: <HistorialClientePage /> },
        { path: "panel-admin-cruds", element: < PanelAdministracionCruds/>},
        { path: "editar-perfil", element: <EditarPerfil /> },
        { path: "pagar-turno", element: <PagosPage />},
        { path: "historial-pagos", element: <HistorialPagos /> }
      ],
    },
  ]);
  
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
reportWebVitals();