import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider.tsx';
import "./index.css";
import reportWebVitals from './reportWebVitals.js';

//Paginas publicas:
import Login from './routes/Login.tsx';
import Signup from './routes/signup.tsx';
import RecoverPassword from './routes/recoverPassword.tsx';
import ResetPassword from './routes/reset-password.tsx';

//Rutas privadas (CRUDS):
import PeluqueroList from './pages/peluquero/PeluqueroPage.tsx';
import ClientesPage from "./pages/cliente/Cliente.page.tsx";
import LocalidadesPage from "./pages/localidad/Localidad.page.tsx";
import TipoServicioPage from "./pages/tipoServicio/Tiposervicio.page.tsx";
import ServiciosPage from "./pages/servicio/Servicio.page.tsx";
import TurnosPage from "./pages/turno/Turno.page.js";
import MenuPage from './pages/MenuPage.js';
import Turnos from './routes/turnos.tsx';

//Rutas privadas (Buscadores):
import HistorialPeluqueroPage from './pages/historialPeluquero/HistorialPeluqueroPage';
import HistorialClientePage from './pages/historialCliente/HistorialClientePage.tsx';

//Rutas privadas (no CRUDS):
import ProtectedRoute from './routes/protectedRoute.tsx';
import HomeCliente from './routes/homeCliente.tsx';
import HomePeluquero from './routes/homePeluquero.tsx';
import TopTresPeluquerosPage from './routes/topTresPeluquerosPage.tsx';
import ListadoTurnosPage from './routes/ListadoTurnosPage.tsx';
import PanelAdministracionCruds from './routes/PanelAdminCRUDs.tsx';

const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
  {
    path: "/login",
    element: <Login />,
  },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
    path: "/recuperar",
    element: <RecoverPassword />,
    },
    { 
      path: '/reset-password/:token', 
      element: <ResetPassword /> 
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        
        { path: "turno", element: <Turnos /> },
        { path: "homeCliente", element: <HomeCliente /> },
        { path: "homePeluquero", element: <HomePeluquero /> },
        //Rutas migradas de App.jsx:
        { path: "peluqueroList", element: <PeluqueroList /> },
        { path: "localidades", element: <LocalidadesPage /> },
        { path: "tipoServicios", element: <TipoServicioPage /> },
        { path: "servicios", element: <ServiciosPage /> },
        { path: "turnos", element: <TurnosPage /> },
        { path: "clientes", element: <ClientesPage /> },
        { path: "menu", element: <MenuPage /> },
        { path: "historial-cliente", element: <HistorialClientePage /> },
        { path: "historial-peluquero", element: <HistorialPeluqueroPage /> },
        { path: "top-peluqueros", element: <TopTresPeluquerosPage/>},
        { path: "listado-turnos", element: <ListadoTurnosPage/>},
        { path: "panel-admin-cruds", element: < PanelAdministracionCruds/>}
      ],
    },
  ]);
  
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode> {/*1*/}
    <AuthProvider>   {/*2*/}
      <RouterProvider router={router} /> {/*3*/}
    </AuthProvider>
    
  </React.StrictMode>
);
reportWebVitals();

/*
1.React.StrictMode
Este es un componente especial de React que no aparece en la UI pero activa chequeos 
adicionales en desarrollo, como:
. Detectar efectos secundarios inseguros.
. Ver si estás usando métodos obsoletos.
. Llamar dos veces a funciones como useEffect() (solo en desarrollo) para asegurarse de 
que no tienen efectos colaterales ocultos. 
*/

/*
2.AuthProvider
Este es tu contexto de autenticación. En resumen:
. Sirve para compartir el estado de autenticación (login, logout, user, etc.) 
entre todos los componentes de tu app.
. Sin esto, cada componente tendría que manejar el estado por separado (una locura).

Gracias a esto, vos podés usar useAuth() desde cualquier componente para saber 
si el usuario está autenticado o no, o para cerrar sesión, por ejemplo.
*/

/*
3.RouterProvider
Este reemplaza al viejo <BrowserRouter> y es parte del nuevo sistema de enrutamiento de 
React Router v6.4+ (data routers).
. Se le pasa el objeto router que definimos con createBrowserRouter().
. Maneja toda la navegación, redirecciones, rutas protegidas, layouts anidados, loaders, etc.

Da más poder y claridad para estructurar rutas complejas, y es ideal para cosas como:
. Rutas públicas y protegidas.
. Dashboards con subrutas.
. Cargar datos antes de renderizar.
*/