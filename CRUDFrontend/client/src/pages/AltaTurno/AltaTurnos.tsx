import { useAltaTurno } from "./hooks/useAltaTurno.ts";
import { getNombrePeluquero, getNombreTipoServicio, getPrecioBase } from "./utils/formUtils.ts";

const AltaTurnoPage = () => {
    const {
        peluqueros,
        tiposServicios,
        horariosDisponibles,
        tipo_turno,
        codigo_peluquero,
        horarioSeleccionado,
        fecha_hora,
        medio_pago,
        tipo_servicio_codigo,
        mostrarConfirmacion,
        payloadConfirmacion,
        loading,
        error,
        errors,
        setTipoTurno,
        setCodigoPeluquero,
        setHorarioSeleccionado,
        setFechaHora,
        setMedioPago,
        setTipo_servicio_codigo,
        setMostrarConfirmacion,
        handleSubmit,
        confirmarTurno
    } = useAltaTurno()

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mt-4">
            <h4>Buscar horarios disponibles</h4>
    
            {/* Selector de peluquero */}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Peluquero</label>
                    <select
                        className="form-select"
                        value={codigo_peluquero ?? ""}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setCodigoPeluquero(value || null);
                        }}
                        >
                        <option value="">Seleccionar...</option>
                        {peluqueros.map((p) => (
                            <option key={p.codigo_peluquero} value={p.codigo_peluquero}>
                                {p.nombre}
                            </option>
                        ))}
                    </select>
                </div>
        
                {/* Selector de fecha */}
                <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input
                    type="date"
                    className="form-control"
                    value={fecha_hora ?? ""}
                    onChange={(e) => {
                    setFechaHora(e.target.value); // ISO format
                    }}
                />
                </div>
        
                {/* Selector de tipo de servicio */}
                <div className="mb-3">
                <label className="form-label">Tipo de servicio</label>
                    <select
                        className="form-select"
                        value={tipo_servicio_codigo ?? ""}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setTipo_servicio_codigo(value || null);
                        }}
                        >
                        <option value="">Seleccionar...</option>
                        {tiposServicios.map((s) => (
                            <option key={s.codigo_tipo} value={s.codigo_tipo}>
                            {s.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Tipo de Turno:</label>
                    <select
                        className="form-select"
                            onChange={(event) => setTipoTurno(event.target.value as "Sucursal" | "A Domicilio")}
                            value={tipo_turno || ""}
                    >
                        <option value="">Seleccione una opcion</option>
                        <option value="Sucursal">Sucursal</option>
                        <option value="A Domicilio">A Domicilio</option>
                    </select>
                    {errors.tipo_turno && <div className="text-danger">{errors.tipo_turno}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Medio de Pago:</label>
                    <select
                        className="form-select"
                        onChange={(event) => setMedioPago(event.target.value as "Efectivo" | "Mercado Pago")}
                        value={medio_pago || ""}
                    >
                        <option value="">Seleccione una opcion</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Mercado Pago">Mercado Pago</option>
                    </select>
                    {errors.medio_pago && <div className="text-danger">{errors.medio_pago}</div>}
                </div>
                
                {/* Tabla de horarios */}
                <h5>Horarios disponibles</h5>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                        <th>Horario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horariosDisponibles.length > 0 ? (
                        horariosDisponibles.map((hora: string, index: number) => (
                            <tr key={index}>
                                <td>
                                    <button
                                        type="button"
                                        className={`btn btn-outline-primary ${horarioSeleccionado === hora ? "active" : ""}`}
                                        onClick={() => setHorarioSeleccionado(hora)}
                                    ></button>
                                    {hora}
                                </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td>No hay horarios disponibles</td>
                        </tr>
                        )}
                    </tbody>
                </table>
                <button type="submit">Reservar turno</button>
            </form>

            {mostrarConfirmacion && payloadConfirmacion && (
                <div className="alert alert-info mt-4">
                    <h5>¿Confirmás tu turno?</h5>
                    <ul>
                        <li><strong>Peluquero:</strong> {getNombrePeluquero(peluqueros , payloadConfirmacion.turno.codigo_peluquero)}</li>
                        <li><strong>Fecha:</strong> {payloadConfirmacion.turno.fecha_hora}</li>
                        <li><strong>Horario:</strong> {horarioSeleccionado}</li>
                        <li><strong>Servicio:</strong> {getNombreTipoServicio(tiposServicios , payloadConfirmacion.servicio.tipo_servicio_codigo)}</li>
                        <li><strong>Tipo de turno:</strong> {payloadConfirmacion.turno.tipo_turno}</li>
                        <li><strong>Medio de pago:</strong> {payloadConfirmacion.servicio.medio_pago}</li>
                        <li><strong>Monto:</strong> {getPrecioBase( tiposServicios , payloadConfirmacion.servicio.tipo_servicio_codigo)}</li>
                    </ul>
                    {/* Botones */}
                    <button className="btn btn-primary me-2" onClick={confirmarTurno}>
                        Confirmar y reservar
                    </button>
                    <button className="btn btn-secondary" onClick={() => setMostrarConfirmacion(false)}>
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

export default AltaTurnoPage;