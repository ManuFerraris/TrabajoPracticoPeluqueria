import { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../auth/constants.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import Swal from "sweetalert2";
import axios from "axios";
import "./historialPagos.css";

interface TipoServicio {
    nombre: string;
    precio_base: number;
    duracion_estimada: number;
};

interface Servicio {
    adicional_adom: number;
    ausencia_cliente: string;
    estado: string;
    medio_pago: 'Efectivo' | 'Stripe';
    monto: number;
    total: number;
    tipoServicio: TipoServicio;
};

interface Cliente {
    codigo_cliente: number;
    NomyApe: string;
    dni: string;
};

interface Turno {
    codigo_turno: number;
    fecha_hora: string;
    porcentaje: number;
    tipo_turno: string;
    estado: string;
    servicio:Servicio;
    cliente: Cliente;
};

interface Pago {
    id: number;
    metodo:'Efectivo' | 'Stripe';
    monto:number;
    estado: 'Pendiente' | 'Pagado' | 'Fallido' | 'Reembolsado' | 'Expirado';
    fecha_hora:string;
    turno: Turno;
};

export default function HistorialPagos() {

    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [fechaFiltro, setFechaFiltro] = useState<string>('');

    const { user } = useAuth();
    const rol = user?.rol;
    const userCodigo = user?.codigo;
    const accessToken = localStorage.getItem('accessToken');

    const fetchPagos = useCallback(async () => {
        setLoading(true);
        if((rol !== 'admin' && rol !== 'cliente') || !accessToken) {
            setError('No autorizado');
            setLoading(false);
            return;
        };
        try{
            const response = await axios.get<{data:Pago[], message?:string}>(`${API_URL}/pagos`, {
                headers: { Authorization: `Bearer ${accessToken}`},
            });
            const pagosRecibidos = response.data.data || [];
            setPagos(pagosRecibidos);
            console.log("Todos los pagos recibidos:", pagosRecibidos);
            if (pagosRecibidos.length === 0) {
                Swal.fire('Historial vacío', 'Aún no hay pagos realizados.', 'info');
            };
        }catch(error){
            console.error("Error obteniendo el historial:", error);
            Swal.fire('Error', 'No se pudo obtener el historial.', 'error');
        }finally{
            setLoading(false);
        };
    },[rol, accessToken]);

    const fetchPagosCliente = useCallback(async (userCodigo: string) => {
        setLoading(true);
        if((rol !== 'admin' && rol !== 'cliente') || !accessToken || !userCodigo) {
            console.log("No autorizado: rol, accessToken, userCodigo: ", rol, accessToken, userCodigo);
            setError('No autorizado');
            setLoading(false);
            return;
        };
        try{
            const response = await axios.get<{data:Pago[], message?:string}>(`${API_URL}/pagos/historialPagosCliente/${userCodigo}`, {
                headers: { Authorization: `Bearer ${accessToken}`},
            });
            const pagosRecibidos = response.data.data || [];
            setPagos(pagosRecibidos);
            console.log("Pagos del cliente recibidos:", pagosRecibidos);
            if (pagosRecibidos.length === 0) {
                Swal.fire('Historial vacío', 'Aún no tenés pagos realizados.', 'info');
            };
        }catch(error){
            console.error("Error obteniendo el historial del cliente:", error);
            Swal.fire('Error', 'No se pudo obtener el historial de pagos del cliente.', 'error');
        }finally{
            setLoading(false);
        };
    },[accessToken, rol]);
    
    useEffect(() => {
        if(rol === 'admin'){
            fetchPagos();
        };
        if(rol === 'cliente'){
            fetchPagosCliente(String(userCodigo));
        };
    }, [fetchPagos, fetchPagosCliente, rol, userCodigo]);

    const pagosFiltrados = pagos.filter((pago) => {
        if (!fechaFiltro) return true;
            const fechaPago = new Date(pago.fecha_hora).toISOString().split('T')[0];
        return fechaPago === fechaFiltro;
    });

    return(
        <div className="historial-pagos-container">
            <h2 style={{ textAlign: 'center' }}>📄 Historial de Pagos</h2>

            {loading && <p>Cargando pagos...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && pagos.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="fecha">📅 Filtrar por fecha:</label>
                    <input
                        type="date"
                        id="fecha"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                        style={{ marginLeft: '0.5rem' }}
                    />
                </div>
            )}

            {!loading && pagos.length > 0 && (
                <>
                    <table className="tabla-pagos">
                        <thead>
                            <tr>
                                <th>🗓 Fecha Pago</th>
                                <th>💰 Monto</th>
                                <th>💰 Total</th>
                                <th>💳 Método</th>
                                <th>📌 Estado</th>
                                <th>✂️ Servicio</th>
                                <th>📅 Turno</th>
                                <th>Codigo Turno</th>
                                <th>Codigo Cliente</th>
                            </tr> 
                        </thead>
                        <tbody>
                            {pagosFiltrados.map((pago) => (
                                <tr key={pago.id}>
                                    <td>{new Date(pago.fecha_hora).toLocaleString()}</td>
                                    <td>${pago.monto}</td>
                                    <td>${pago.turno.servicio?.total ?? 0 }</td>
                                    <td>{pago.metodo}</td>
                                    <td>{pago.estado}</td>
                                    <td>{pago.turno.servicio?.tipoServicio.nombre ?? 'Sin Servicio'}</td>
                                    <td>{new Date(pago.turno.fecha_hora).toLocaleString()}</td>
                                    <td>{pago.turno.codigo_turno}</td>
                                    <td>{pago.turno.cliente.codigo_cliente}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {fechaFiltro && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button onClick={() => setFechaFiltro('')}>
                                Limpiar filtro
                            </button>
                        </div>
                    )}
                </>
            )}

        {!loading && pagosFiltrados.length === 0 && (
            <h5 style={{ textAlign: 'center' }}>No hay pagos registrados en esa fecha.</h5>
        )}
    </div>
    );
};