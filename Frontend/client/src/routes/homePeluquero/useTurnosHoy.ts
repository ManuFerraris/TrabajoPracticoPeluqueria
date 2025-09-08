import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../auth/constants.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";

export function useTurnosHoy() {
    const { user, isAuthenticated } = useAuth();
    const accessToken = localStorage.getItem("accessToken");
    const [cantidadTurnosHoy, setCantidadTurnosHoy] = useState<number | null>(null);
    const [cantidadTurnosActivos, setCantidadTurnosActivos] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tipoPel, setTipoPel] = useState<string>('');
    
    useEffect(()=> {
        const fetchTurnos = async ()=> {
            if (!isAuthenticated || !user?.codigo || !accessToken) return;
            setIsLoading(true);
            try {
                const codigo_peluquero = user.codigo;
                const response = await axios.get(`${API_URL}/peluqueros/misTurnos/${codigo_peluquero}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setCantidadTurnosHoy(response.data.cantidadTurnos);
                console.log("Response: ", response);
                const cantTurnosAct = Array.isArray(response.data.data?.turnos) ? response.data.data.turnos.length : 0;
                setCantidadTurnosActivos(cantTurnosAct);
            } catch (error: any) {
                console.error("Error al traer turnos del peluquero:", error);
            } finally {
                setIsLoading(false);
            };
        };
        fetchTurnos();

        const fetchPeluquero = async () => {
            if (!isAuthenticated || !user?.codigo || !accessToken) return;
            setIsLoading(true);
            try {
                const codigo_peluquero = user.codigo;
                const response = await axios.get(`${API_URL}/peluqueros/${codigo_peluquero}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                console.log("Response de peluquero: ", response);
                const tipPel = response.data?.data ? response.data.data.tipo : 'Tipo no encontrado'
                setTipoPel(tipPel);
            } catch (error: any) {
                console.error("Error al traer turnos del peluquero:", error);
            } finally {
                setIsLoading(false);
            };
        };
        fetchPeluquero();
    }, [isAuthenticated, user?.codigo, accessToken]);


    return { cantidadTurnosHoy, cantidadTurnosActivos, tipoPel, isLoading };
};