import Swal from "sweetalert2";

export const mostrarErrorTurno = (error:any) => {
    const mensaje = error.response?.data?.message ?? "Error inesperado";
    const detalles = error.response?.data?.data;

    if (Array.isArray(detalles) && detalles.length > 0) {
        Swal.fire({
        icon: "error",
        title: "Error al reservar turno",
        html: `
            <p>${mensaje}</p>
            <ul style="text-align:left;">
            ${detalles.map((d: string) => `<li>${d}</li>`).join("")}
            </ul>
        `,
        confirmButtonText: "Aceptar",
        position: "center"
        });
    } else {
        Swal.fire({
        icon: "error",
        title: "Error",
        text: mensaje,
        confirmButtonText: "Aceptar",
        position: "center"
        });
    };
};