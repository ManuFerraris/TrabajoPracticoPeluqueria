import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';

function PeluqueroList() {
    const [peluqueros, setPeluqueros] = useState([]); // Lista de Peluqueros
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [nombre, setNombre] = useState('');
    const [fecha_Ingreso, setFechaIngreso] = useState('');
    const [tipo, setTipo] = useState('');
    const [editar, setEditar] = useState(false);
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState(null);

    useEffect(() => {
        const fetchPeluqueros = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/peluqueros');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPeluqueros(data.data || []); // Asegúrate de que esta propiedad exista en la respuesta JSON
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPeluqueros();
    }, []);

    useEffect(() => {
        if (peluqueroSeleccionado) {
            setNombre(peluqueroSeleccionado.nombre || '');
            setFechaIngreso(peluqueroSeleccionado.fecha_Ingreso || '');
            setTipo(peluqueroSeleccionado.tipo || '');
        }
    }, [peluqueroSeleccionado]);

    const getPeluqueros = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/peluqueros');
            const peluqueros = response.data.data;
            if (Array.isArray(peluqueros)) {
                setPeluqueros(peluqueros);
            }
        } catch (error) {
            console.error('Error al obtener los peluqueros:', error);
            setPeluqueros([]);
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (editar) {
                await Axios.put(`http://localhost:3000/api/peluqueros/${peluqueroSeleccionado.codigo_peluquero}`, {
                    nombre: nombre,
                    fecha_Ingreso: new Date(fecha_Ingreso).toISOString().split('T')[0],
                    tipo: tipo
                });
                alert('Peluquero Actualizado');
            } else {
                await Axios.post('http://localhost:3000/api/peluqueros', {
                    nombre: nombre,
                    fecha_Ingreso: new Date(fecha_Ingreso).toISOString().split('T')[0],
                    tipo: tipo
                });
                alert('Peluquero Registrado');
            }
            getPeluqueros();
            setNombre("");
            setFechaIngreso("");
            setTipo("");
            setErrors({});
            setEditar(false);
        } catch (error) {
            console.error('Error al guardar el peluquero:', error);
            alert('Error al guardar el peluquero');
        }
    };

    const eliminarPeluquero = (codigo_peluquero) => {
        console.log('Eliminando peluquero con código:', codigo_peluquero);
        Axios.delete(`http://localhost:3000/api/peluqueros/${codigo_peluquero}`)
            .then(() => {
                getPeluqueros();
                alert('Peluquero Eliminado');
            })
            .catch(error => {
                console.error('Error al eliminar el peluquero:', error);
                alert('Error al eliminar el peluquero');
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    GESTION DE PELUQUEROS
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Nombre y Apellido:</span>
                            <input type="text"
                                onChange={(event) => setNombre(event.target.value)}
                                className="form-control" value={nombre || ""} placeholder="Nombre y Apellido" aria-label="Nombre y Apellido" aria-describedby="basic-addon1" />
                            {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                        </div>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Fecha de Ingreso:</span>
                            <input type="date"
                                onChange={(event) => setFechaIngreso(event.target.value)}
                                className="form-control" value={fecha_Ingreso || ""} aria-label="Fecha de Ingreso" aria-describedby="basic-addon1" />
                            {errors.fecha_Ingreso && <div className="text-danger">{errors.fecha_Ingreso}</div>}
                        </div>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Tipo:</span>
                            <select
                                className="form-select"
                                onChange={(event) => setTipo(event.target.value)}
                                value={tipo || ""}
                                aria-label="Tipo">
                                <option value="">Seleccione su tipo</option>
                                <option value="Domicilio">Domicilio</option>
                                <option value="Sucursal">Sucursal</option>
                            </select>
                            {errors.tipo && <div className="text-danger">{errors.tipo}</div>}
                        </div>

                        <div>
                            {
                                editar ?
                                    <div>
                                        <button type="submit" className='btn btn-warning m-2'>Actualizar</button>
                                        <button type="button" className='btn btn-info m-2' onClick={() => setEditar(false)}>Cancelar</button>
                                    </div>
                                    :
                                    <button type="submit" className='btn btn-success'>Registrar</button>
                            }
                        </div>
                    </form>
                </div>
                <div className="card-footer text-muted"></div>
            </div>

            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th scope="col">Codigo</th>
                        <th scope="col">Nombre y Apellido</th>
                        <th scope="col">Fecha de Ingreso</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        peluqueros.map(val => (
                            <tr key={val.codigo_peluquero}>
                                <th>{val.codigo_peluquero}</th>
                                <td>{val.nombre}</td>
                                <td>{val.fecha_Ingreso}</td>
                                <td>{val.tipo}</td>
                                <td>
                                    <div className="btn-group" role="group" aria-label="Basic example">
                                        <button type="button" onClick={() => { setPeluqueroSeleccionado(val); setEditar(true); }} className="btn btn-info">Editar</button>
                                        <button type="button" onClick={() => eliminarPeluquero(val.codigo_peluquero)} className="btn btn-danger">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}

export default PeluqueroList;
