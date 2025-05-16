import React, { useContext, createContext, useState, useEffect } from "react";

const API_URL = 'http://localhost:3000';

// Datos que se van a almaecenar mientras el usuario este autenticado, se almacenaran en el localStorage
interface UserData {
    codigo: number;
    email: string;
    rol: 'cliente' | 'peluquero';
    nombre: string;
    // Agregar otros campos según necesidad
}

// Contexto de autenticación
// Este contexto se va a encargar de almacenar los datos del usuario y los tokens de acceso y refresco
interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    accessToken: string | null;
    refreshToken: string | null;
    login: (accessToken: string, refreshToken: string, userData: UserData) => void;
    logout: () => void;
    refreshAuth: () => Promise<boolean>;
    setUser: (user: Partial<UserData>) => void;
}

// Creamos el contexto de autenticación
// Estos datos son solo iniciales, se van a sobreescribir cuando el usuario inicie sesión (en el Provider)
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    login: () => {},
    logout: () => {},
    refreshAuth: async () => false,
    setUser: () => {}
});

interface AuthProviderProps {
    children: React.ReactNode;
}

// Mantiene el estado de autenticación y proporciona funciones para iniciar/cerrar sesión y refrescar el token
export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    // Efecto para cargar la autenticación al iniciar
    useEffect(() => {
        const loadAuthData = () => {
        try {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            const storedUser = localStorage.getItem('user');

            if (storedAccessToken && storedRefreshToken && storedUser) {
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Error al cargar datos de autenticación:", error);
            logout();
        }
    };

    loadAuthData();
    }, []);

  // Función para iniciar sesión
    const login = (
        accessToken: string, 
        refreshToken: string, 
        userData: UserData,
    ) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Redirige luego de actualizar el estado
        /*if (navigate) {
            const destino = userData.rol === 'cliente' ? '/homeCliente' : '/homePeluquero';
            navigate(destino);
        };*/
    };

    // Función para cerrar sesión
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
        
    };

    // Función para actualizar datos del usuario
    const updateUser = (newData: Partial<UserData>) => {
        if (!user) return;
        
        const updatedUser = { ...user, ...newData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    // Función para refrescar el token de acceso
    const refreshAuth = async (): Promise<boolean> => {
        if (!refreshToken) return false;
        console.log("Intentando refrescar token con:", refreshToken);
        try {
            const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

        if (response.ok) {
            const data = await response.json();
            console.log("Nuevo accessToken obtenido:", data.accessToken);
            localStorage.setItem('accessToken', data.accessToken);
            setAccessToken(data.accessToken);
            return true;
        }
        } catch (error) {
        console.error("Error al refrescar token:", error);
        }

        logout();
        return false;
    };

    const contextValue: AuthContextType = {
        isAuthenticated,
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        refreshAuth,
        setUser: updateUser
    };

    return (
        <AuthContext.Provider value={contextValue}>
        {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);