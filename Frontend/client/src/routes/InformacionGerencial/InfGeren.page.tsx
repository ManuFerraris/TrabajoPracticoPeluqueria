import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../auth/constants.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";

export default function InformacionGerencialPage() {
    const [cantTurnosAten, setCantTurnosAten] = useState<number>(0);
    const [cantTurnosCancel, setCantTurnosCancel] = useState<number>(0);
    const [ingNeto, setIngNeto] = useState<number>(0);
    const [ingBruto, setIngBruto] = useState<number>(0);
    const [promIngPorTurno, setPromIngPorTurno] = useState<number>(0);
    const [cantCliActivos, setCantCliActivos] = useState<number>(0);
    const [cantCliSancionados, setCantCliSancionados] = useState<number>(0);
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [resumenPeluqueros, setResumenPeluqueros] = useState<
        { nomPel: string; cantTurnos: number; ingNeto: number }[]
    >([]);
    const [cantTurnosADom, setCantTurnosADom] = useState<number>(0);
    const [porcTurnosADom, setPorcTurnosADom] = useState<number>(0);
    const [cantTotalClientes, setCantTotalClientes] = useState<number>(0);
    const [cantClientesNuevos, setCantClientesNuevos] = useState<number>(0);
    const [cancelaciones, setCancelaciones] = useState<{ nombre: string; cantCancel: number } | null>(null);

    const auth = useAuth();
    const rol = auth.user?.rol;
    const accessToken = localStorage.getItem('accessToken');

    const fetchResumenGeneral = useCallback(async () => {
        if (rol !== 'admin') return;
        if (!fechaDesde || !fechaHasta) return;

        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/informeGerencial`,
                { fechaDesde, fechaHasta },
                { headers: { 'Authorization': accessToken } }
            );
            const datos = response.data.data;
            //console.log(datos);
            setCantTurnosAten(datos.cantTurnosAten || 0);
            setCantTurnosCancel(datos.cantTurnosCancel || 0);
            setIngNeto(datos.ingNeto || 0);
            setIngBruto(datos.ingBruto || 0);
            setPromIngPorTurno(datos.promIngPorTurno || 0);
            setCantCliActivos(datos.cantCliActivos || 0);
            setCantCliSancionados(datos.cantCliSancionados || 0);
        }catch(error:any){
            console.error("Error al cargar datos del informe: ", error);
        }finally{
            setLoading(false);
        };
    },[accessToken, rol, fechaDesde, fechaHasta]);

    const fetchResumenPorPeluquero = useCallback( async ()=> {
        if (rol !== 'admin') return;
        if (!fechaDesde || !fechaHasta) return;

        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/informeGerencial/resumenPorPeluquero`,
                { fechaDesde, fechaHasta },
                { headers: { 'Authorization': accessToken } }
            );
            const datos = response.data.data;
            //console.log(datos);
            setResumenPeluqueros(datos.peluqueros || []);
            setCantTurnosADom(datos.cantTurnosADom || 0);
            setPorcTurnosADom(datos.porcTotal || 0);
        }catch(error:any){
            console.error("Error al cargar datos del informe por peluqueros: ", error);
        }finally{
            setLoading(false);
        };
    },[accessToken, rol, fechaDesde, fechaHasta]);

    const fetchComportamientoClientes = useCallback( async ()=> {
        if (rol !== 'admin') return;
        if (!fechaDesde || !fechaHasta) return;

        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/informeGerencial/resumenClientes`,
                { fechaDesde, fechaHasta },
                { headers: { 'Authorization': accessToken } }
            );
            const datos = response.data.data;
            //console.log(datos);
            setCantTotalClientes(datos.cantTotalClientes);
            setCantClientesNuevos(datos.cantClientesNuevos);
            setCancelaciones(datos.clientesCancelaciones);
        }catch(error:any){
            console.error("Error al cargar datos del informe sobre clientes: ", error);
        }finally{
            setLoading(false);
        };
    },[accessToken, rol, fechaDesde, fechaHasta]);

    useEffect(()=> {
        fetchResumenGeneral();
        fetchResumenPorPeluquero();
        fetchComportamientoClientes();
    },[fetchResumenGeneral, fetchResumenPorPeluquero, fetchComportamientoClientes]);

    return(
        <div className="card text-black" style={{ padding: "1rem" }}>
            <h2>Información Gerencial</h2>

            <div style={{ marginBottom: "1rem" }}>
                <label>
                    Fecha Desde:{" "}
                    <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </label>
                <label style={{ marginLeft: "1rem" }}>
                    Fecha Hasta:{" "}
                    <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </label>
                <button
                    onClick={fetchResumenGeneral}
                    style={{ marginLeft: "1rem" }}
                    disabled={loading}
                >
                    {loading ? "Consultando..." : "Consultar"}
                </button>
            </div>

            <table border={1} cellPadding={8}>
                <thead>
                    <tr>
                        <th>Métrica</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Turnos Atendidos</td><td>{cantTurnosAten}</td></tr>
                    <tr><td>Turnos Cancelados</td><td>{cantTurnosCancel}</td></tr>
                    <tr><td>Ingreso Neto</td><td>${ingNeto.toFixed(2)}</td></tr>
                    <tr><td>Ingreso Bruto</td><td>${ingBruto.toFixed(2)}</td></tr>
                    <tr><td>Promedio por Turno</td><td>${promIngPorTurno.toFixed(2)}</td></tr>
                    <tr><td>Clientes Activos</td><td>{cantCliActivos}</td></tr>
                    <tr><td>Clientes Sancionados</td><td>{cantCliSancionados}</td></tr>
                    <tr><td>Turnos a Domicilio</td><td>{cantTurnosADom}</td></tr>
                    <tr><td>% Turnos a Domicilio</td><td>{porcTurnosADom}%</td></tr>
                </tbody>
            </table>
            <h3>Resumen por Peluquero</h3>
            <table border={1} cellPadding={8}>
                <thead>
                    <tr>
                    <th>Peluquero</th>
                    <th>Turnos Atendidos</th>
                    <th>Ingreso Neto</th>
                    </tr>
                </thead>
                <tbody>
                    {resumenPeluqueros.map((p, i) => (
                    <tr key={i}>
                        <td>{p.nomPel}</td>
                        <td>{p.cantTurnos}</td>
                        <td>${p.ingNeto.toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <div className="panel-clientes">
                <h3>Comportamiento de Clientes</h3>

                {cantTotalClientes === 0 ? (
                    <p style={{ color: 'gray' }}>No se encontraron clientes en este período.</p>
                ) : (
                    <p><strong>Total de clientes:</strong> {cantTotalClientes}</p>
                )}

                <p><strong>Clientes nuevos en el período:</strong> {cantClientesNuevos}</p>

                {cancelaciones && (
                    <div className="cancelaciones">
                    <p><strong>Cancelaciones:</strong></p>
                    <p>{cancelaciones.nombre} canceló {cancelaciones.cantCancel} turno(s)</p>
                    </div>
                )}
            </div>
        </div>
    );
};