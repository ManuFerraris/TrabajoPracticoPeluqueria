import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error("Error en la ruta:", error);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Ups, algo salió mal</h1>
            <p>No pudimos cargar esta página.</p>
            <p style={{ color: "gray" }}>
                {error instanceof Error ? error.message : "Error desconocido"}
            </p>
        </div>
    );
};