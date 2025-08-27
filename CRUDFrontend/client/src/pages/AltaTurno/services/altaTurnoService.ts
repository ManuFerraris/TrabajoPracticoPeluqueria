import axios from "axios";
import { API_URL } from "../../../auth/constants.ts";
import { Payload } from "../types/turno.types.ts";

export const turnoService = {
    fetchPeluqueros: async (accessToken:string) => {
        const response = await axios.get(`${API_URL}/peluqueros`, {
            headers: { Authorization: `Bearer ${accessToken}`}
        })
        const peluqueros = response.data?.data || [];
        return peluqueros;
    },

    fetchTiposServicios: async (accessToken:string) => {
        const response = await axios.get(`${API_URL}/tiposervicio`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        })
        const tiposServicios = response.data?.data || [];
        return tiposServicios;
    },

    fetchHorarios: async (
        codigo_pelquuero: number,
        tipo_servicio_codigo:number,
        fechaHora: string,
        accessToken:string
    ) => {
        const response = await axios.get(
            `${API_URL}/peluqueros/horariosDisponibles/${codigo_pelquuero}/${tipo_servicio_codigo}`,
            {
                params: { fechaHora },
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        const horariosDisponibles = response.data?.data || [];
        return horariosDisponibles;
    },

    confirmarTurno: async (payload: Payload, accessToken: string) => {
        const response = await axios.post(`${API_URL}/turnos/altaTurno`, payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data?.data
    }
};