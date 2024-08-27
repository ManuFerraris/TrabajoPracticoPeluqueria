import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';

function PeluqueroList() {
    const [peluqueros, setPeluqueros] = useState([]); //lista de Peluqueros
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setPeluqueros(data.data); // Asegúrate de que esta propiedad existe en la respuesta JSON
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

    const getPeluqueros = ()=> {
        Axios.get('http://localhost:3000/api/peluqueros').then((response) => {
        const peluqueros = response.data.data; // Acceder a la propiedad 'data'
        if (Array.isArray(peluqueros)) {
        setPeluqueros(peluqueros);
        }
        }).catch((error) => {
        console.error('Error al obtener los peluqueros:', error);
        setPeluqueros([]);
        });
    }

    const add = () => { // Función para añadir un nuevo peluquero
        const FechaFormateada = new Date(fecha_Ingreso).toISOString().split('T')[0];
        Axios.post('http://localhost:3000/api/peluqueros', {
        nombre: nombre,
        fecha_Ingreso: FechaFormateada,
        tipo: tipo
        }).then(() => {
        getPeluqueros();
        alert('Peluquero Registrado');
        }).catch(error => {
        console.error('Error al registrar el peluquero:', error);
        alert('Error al registrar el peluquero');
        });
        };

    const actualizarPeluquero = () => {
    if (peluqueroSeleccionado) {
        const fechaValida = new Date(fecha_Ingreso);
        if (!isNaN(fechaValida.getTime())) {
            const FechaFormateada = fechaValida.toISOString().split('T')[0];
            Axios.put(`http://localhost:3000/api/peluqueros/${peluqueroSeleccionado.codigo_peluquero}`, {
            nombre: nombre,
            fecha_Ingreso: FechaFormateada,
            tipo: tipo
        }).then(() => {
            getPeluqueros();
            setEditar(false);
            alert('Peluquero Actualizado');
        }).catch(error => {
            console.error('Error al actualizar el peluquero:', error);
            alert('Error al actualizar el peluquero');
        });
        } else {
        alert('Fecha de ingreso inválida');
        }
    }
    }

    const eliminarPeluquero = (codigo_peluquero) => {
        console.log('Eliminando peluquero con código:', codigo_peluquero); // Ver en terminal
        Axios.delete(`http://localhost:3000/api/peluqueros/${codigo_peluquero}`)
        .then(() => {
        getPeluqueros(); // Actualiza la lista después de eliminar
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
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">Nombre y Apellido:</span>
                    <input type="text"
                        onChange={(event) => setNombre(event.target.value)}
                        className="form-control" value={nombre || ""} placeholder="Nombre y Apellido" aria-label="Nombre y Apellido" aria-describedby="basic-addon1" />
                </div>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">Fecha de Ingreso:</span>
                    <input type="date"
                        onChange={(event) => setFechaIngreso(event.target.value)}
                        className="form-control" value={fecha_Ingreso || ""} aria-label="Fecha de Ingreso" aria-describedby="basic-addon1" />
                </div>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">Tipo:</span>
                    <input type="text"
                        onChange={(event) => setTipo(event.target.value)}
                        className="form-control" value={tipo || ""} placeholder="Tipo" aria-label="Tipo" aria-describedby="basic-addon1" />
                </div>

                <div>
                    {
                        editar ?
                            <div>
                                <button className='btn btn-warning m-2' onClick={actualizarPeluquero}>Actualizar</button>
                                <button className='btn btn-info m-2' onClick={() => setEditar(false)}>Cancelar</button>
                            </div>
                            :
                            <button className='btn btn-success' onClick={add}>Registrar</button>
                    }
                </div>
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
