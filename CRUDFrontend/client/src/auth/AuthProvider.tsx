import React, { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'http://localhost:3000';

// Datos que se van a almaecenar mientras el usuario este autenticado, se almacenaran en el localStorage
interface UserData {
    codigo: number;
    codigo_peluquero?: number;
    email: string;
    rol: 'cliente' | 'peluquero'|'admin';
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
    const login = (accessToken:string, refreshToken:string, userData: UserData ) => {
        
        if (!accessToken || !userData) {
            console.error("Error: El backend envió un accessToken o userData vacío.");
            return;
        };
        
        console.log("Guardando accessToken en localStorage:", accessToken);
        console.log("Guardando userData en localStorage:", JSON.stringify(userData));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(userData);
        setIsAuthenticated(true);

        console.log("`accessToken` guardado correctamente en localStorage.");
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
        try {
            const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {refreshToken});
            
            if(response.status === 200){
                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);
                return true;
            };
        } catch (error: any) {
        console.error("Error al refrescar token:", error.response?.data || error.message);
        };
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