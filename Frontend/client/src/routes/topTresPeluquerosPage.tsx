import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from '../auth/constants.ts';
//import { useAuth } from '../auth/AuthProvider.tsx';

// Tipos para la respuesta
interface Cliente {
    codigo_cliente: number;
    NomyApe: string;
}

interface Turno {
    codigo_turno: number;
    fecha_hora: string;
    cliente: Cliente;
}

interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
    email: string;
    tipo: string;
    fecha_Ingreso: string;
    turnos: Turno[];
}

function TopTresPeluquerosPage() {
    const [peluquerosTop, setPeluquerosTop] = useState<Peluquero[]>([]);
    //const { user: userData } = useAuth();
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchTopPeluqueros = async () => {
        try {
            const res = await axios.get(`${API_URL}/peluqueros/topTresPeluqueros`, {
            headers: { Authorization: `Bearer ${accessToken}` }
            });
            setPeluquerosTop(res.data.data || []);
        } catch (err) {
            console.error("Error obteniendo el top 3 de peluqueros:", err);
            Swal.fire('Error', 'No se pudo obtener el ranking de peluqueros.', 'error');
        }
        };

        fetchTopPeluqueros();
    }, [accessToken]);

    const contarClientesUnicos = (turnos: Turno[]): number => {
        const clientesSet = new Set(turnos.map(t => t.cliente?.codigo_cliente));
        return clientesSet.size;
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-success text-white text-center">
                    <h3>Top 3 Peluqueros con Más Clientes</h3>
                </div>
                <div className="card-body">
                    <table className="table table-bordered table-hover">
                        <thead className="table-success">
                        <tr>
                            <th>Ranking</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Tipo</th>
                            <th>Clientes Únicos</th>
                        </tr>
                        </thead>
                        <tbody>
                        {peluquerosTop.length > 0 ? (
                            peluquerosTop.map((p, index) => (
                            <tr key={p.codigo_peluquero}>
                                <td>{index + 1}</td>
                                <td>{p.nombre}</td>
                                <td>{p.email}</td>
                                <td>{p.tipo}</td>
                                <td>{contarClientesUnicos(p.turnos)}</td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan={5} className="text-center">No se encontraron datos.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TopTresPeluquerosPage;