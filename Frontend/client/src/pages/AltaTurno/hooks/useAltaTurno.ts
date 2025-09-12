import { useState, useEffect } from "react";
import Swal from "sweetalert2"
import { useAuth } from "../../../auth/AuthProvider.tsx";
import { turnoService } from "../services/altaTurnoService.ts";
import { Peluquero, TipoServicio, Payload, FormErrors } from "../types/turno.types.ts"
import { mostrarErrorTurno } from "../utils/errorFeedback.ts";

export const useAltaTurno = () => {
    const { user } = useAuth()
    const accessToken = localStorage.getItem("accessToken")

    // Datos cargados
    const [peluqueros, setPeluqueros] = useState<Peluquero[]>([])
    const [tiposServicios, setTiposServicios] = useState<TipoServicio[]>([])
    const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])

    // Estado del formulario
    const [tipo_turno, setTipoTurno] = useState<"Sucursal" | "A Domicilio">("Sucursal")
    const [codigo_peluquero, setCodigoPeluquero] = useState<number | null>(null)
    const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null)
    const [fecha_hora, setFechaHora] = useState<string>("")
    const [medio_pago, setMedioPago] = useState<"Stripe" | "Efectivo">("Efectivo")
    const [tipo_servicio_codigo, setTipo_servicio_codigo] = useState<number | null>(null)

    // Estado general
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [payloadConfirmacion, setPayloadConfirmacion] = useState<Payload | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<FormErrors>({})

    const codigo_cliente = user?.codigo

    // Fetch inicial
    useEffect(() => {
        if (!accessToken) return;

        const cargarDatos = async () => {
            setLoading(true);
            try {
                const [peluqueros, tiposServicios] = await Promise.all([
                    turnoService.fetchPeluqueros(accessToken),
                    turnoService.fetchTiposServicios(accessToken)
                ]);
                setPeluqueros(peluqueros);
                setTiposServicios(tiposServicios);
            } catch (err) {
                setError("Error al cargar datos");
            } finally {
                setLoading(false);
            };
        };
        cargarDatos();
    }, [accessToken]);

    // Fetch de horarios disponibles
    useEffect(() => {
        if (codigo_peluquero && tipo_servicio_codigo && fecha_hora && accessToken) {
            setLoading(true)
            turnoService
                .fetchHorarios(codigo_peluquero, tipo_servicio_codigo, fecha_hora, accessToken)
                .then(setHorariosDisponibles)
                .catch(() => setError("Error al cargar horarios"))
                .finally(() => setLoading(false));
        };
    }, [codigo_peluquero, tipo_servicio_codigo, fecha_hora, accessToken]);

    // Validaciones:
    const validateForm = () => {
        const errors:FormErrors = {};

        const today = new Date().toISOString().split('T')[0];

        if (!tipo_turno) {
            errors.tipo_turno = "El tipo es obligatorio.";
        } else if(tipo_turno !== "Sucursal" && tipo_turno !== "A Domicilio"){
            errors.tipo_turno = "Seleccione un tipo de turno.";
        };

        if (!medio_pago) {
            errors.codigo_peluquero = "El medio de pago es obligatorio.";
        }else if(medio_pago !== "Stripe" && medio_pago !== "Efectivo"){
            errors.tipo_turno = "Seleccione un tipo de turno.";
        };

        if (!fecha_hora) {
            errors.fecha_hora = "La fecha es obligatoria.";
        } else if(fecha_hora < today){
            errors.fecha_hora = "La fecha no puede ser menor a la de hoy";
        };

        if (!codigo_peluquero) {
            errors.codigo_peluquero = "El codigo de peluquero es obligatorio.";
        };

        if(!tipo_servicio_codigo){
            errors.tipo_servicio_codigo = "El tipo de servicio es obligatorio.";
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent )=>{
        e.preventDefault();
        console.log("Submit ejecutado")
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            Swal.fire("Error", "Hubo un error de validacion.");
            return;
        };
        if (!horarioSeleccionado) {
            Swal.fire("Error", "Debés seleccionar un horario disponible", "error");
            return;
        };
        if (!fecha_hora || isNaN(Date.parse(fecha_hora))) {
            Swal.fire("Error", "La fecha seleccionada no es válida", "error");
            return;
        };
        const fechaHoraCompleta = `${fecha_hora}T${horarioSeleccionado}:00`;
        const turnoDTO = {
            tipo_turno,
            codigo_cliente,
            codigo_peluquero,
            fecha_hora: fechaHoraCompleta,
        };

        const servicioDTO = {
            medio_pago: medio_pago,
            tipo_servicio_codigo: Number(tipo_servicio_codigo),
        };
        const payload = {
            turno: turnoDTO,
            servicio: servicioDTO
        };
        setPayloadConfirmacion(payload); // se guarda en estado.
        setMostrarConfirmacion(true);    // se muestra el modal.
    };

    // Confirmación
    const confirmarTurno = async () => {
        if (!accessToken || !payloadConfirmacion) return;

        try {
            const respuesta = await turnoService.confirmarTurno(payloadConfirmacion, accessToken);
            //console.log("Turno confirmado:", respuesta);
            if (respuesta === null) {
                Swal.fire("Error", "No se pudo confirmar el turno", "error");
                return;
            };
            Swal.fire(
                "Turno reservado",
                "Tu turno fue confirmado correctamente",
                "success");
            setMostrarConfirmacion(false);
        } catch (error: any) {
            console.error("Error generico al guardar el turno:", error);
            mostrarErrorTurno(error);
        };
    };

    return{
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
    };
};