/*import React, { useState } from "react";
import { createPeluquero } from "../Peluquero.service";

const PeluqueroForm = ({ refreshPeluqueros }) => {
    const [nombre, setNombre] = useState("");
    const [fecha_Ingreso, setFechaIngreso] = useState("");
    const [tipo, setTipo] = useState("");
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        await createPeluquero({ nombre, fecha_Ingreso, tipo });
        refreshPeluqueros();
        setNombre("");
        setFechaIngreso("");
        setTipo("");
        setErrors({});
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!nombre) {
            errors.nombre = "El nombre es obligatorio.";
        } else if (nombre.length > 255) {
            errors.nombre = "El nombre no puede tener más de 255 caracteres.";
        }

        if (!fecha_Ingreso) {
            errors.fecha_Ingreso = "La fecha de ingreso es obligatoria.";
        } else if (fecha_Ingreso >= today) {
            errors.fecha_Ingreso = "La fecha de ingreso no puede ser mayor o igual a la fecha actual.";
        }

        if (!tipo) {
            errors.tipo = "El tipo es obligatorio.";
        } else if (tipo !== "Domicilio" && tipo !== "Sucursal") {
            errors.tipo = "El tipo debe ser 'Domicilio' o 'Sucursal'.";
        }

        return errors;
    };

    return (
        <div>
            <h2>Agregar Peluquero</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre y Apellido"
                        required
                    />
                    {errors.nombre && <div style={{ color: 'red' }}>{errors.nombre}</div>}
                </div>
                <div>
                    <input
                        type="date"
                        value={fecha_Ingreso}
                        onChange={(e) => setFechaIngreso(e.target.value)}
                        placeholder="Fecha de Ingreso"
                        required
                    />
                    {errors.fecha_Ingreso && <div style={{ color: 'red' }}>{errors.fecha_Ingreso}</div>}
                </div>
                <div>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                        <option value="">Selecciona el tipo</option>
                        <option value="Domicilio">Domicilio</option>
                        <option value="Sucursal">Sucursal</option>
                    </select>
                    {errors.tipo && <div style={{ color: 'red' }}>{errors.tipo}</div>}
                </div>
                <button type="submit">Agregar</button>
            </form>
        </div>
    );
};
export default PeluqueroForm;*/