/*import React, { useState } from "react";
import { createPeluquero } from "../Peluquero.service";

const PeluqueroForm = ({ refreshPeluqueros }) => {
    const [nombre, setNombre] = useState("");
    const [fecha_Ingreso, setFechaIngreso] = useState("");
    const [tipo, setTipo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createPeluquero({ nombre, fecha_Ingreso: fecha_Ingreso, tipo });
        refreshPeluqueros();
        setNombre("");
        setFechaIngreso("");
        setTipo("");
    }


return (
    <div>
        <h2>Agregar Peluquero</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y Apellido"
                required
            />
            <input
                type="date"
                value={fecha_Ingreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                placeholder="Fecha de Ingreso"
                required
            />
            <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Tipo"
                required
            />
            <button type="submit">Agregar</button>
        </form>
    </div>
);
}
export default PeluqueroForm;*/