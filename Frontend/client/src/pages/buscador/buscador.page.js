import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';

function Buscadorpage(){
    const [codigo_peluquero, setCodigo_peluquero] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nombre, setNombre] = useState('');

    const obtenerNombrePeluquero = async (codigo) => {
        try {
            const response = await axios.get(`${API_URL}/peluqueros/${codigo}`);
            setNombre(response.data.nombre);
            console.log(response.data.nombre);
        } catch (err) {
            setError(error.response?.data?.message || error.message);
            console.log('Error en consola: ', error.response?.data?.message || error.message)
            setNombre('');
        };
    };


    const buscarTurnos = async () => {
        setLoading(true);
        setError(null);

        obtenerNombrePeluquero(codigo_peluquero);

        try {
            const response = await axios.get(`${API_URL}/buscador/${codigo_peluquero}`);
            setTurnos(response.data.data);
            Swal.fire('Éxito', 'Turnos cargados correctamente', 'success');
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // Si el código de peluquero no existe
                setError('El código de peluquero no existe. Por favor, ingrese otro.');
                Swal.fire('Error', 'El código de peluquero no existe.', 'error');
            } else {
                setError('Error al cargar los turnos. Intenta de nuevo.');
                Swal.fire('Error', 'No se pudieron cargar los turnos', 'error');
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center text-primary mb-4">Buscador de Turnos</h2>

            {/* Mostrar el nombre del peluquero */}
            {nombre && (
                <div className="alert alert-info text-center mb-4">
                    <strong>Peluquero:</strong> {nombre}
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="codigoPeluquero" className="form-label">Código del Peluquero</label>
                <input
                    type="text"
                    id="codigoPeluquero"
                    className="form-control"
                    value={codigo_peluquero}
                    onChange={(e) => setCodigo_peluquero(e.target.value)}
                    placeholder="Introduce el código del peluquero"
                />
            </div>

            <button
                className="btn btn-primary w-100 mb-3"
                onClick={buscarTurnos}
                disabled={loading || !codigo_peluquero}
            >
                {loading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                ) : (
                    'Buscar Turnos'
                )}
            </button>

            {error && (
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            )}

            <div className="mt-4">
                {turnos.length > 0 ? (
                    <table className="table table-striped table-bordered shadow-sm">
                        <thead>
                            <tr className="table-dark">
                                <th>Código Turno</th>
                                <th>Cod. Cliente</th>
                                <th>Fecha y Hora</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnos.map((turno) => (
                                <tr key={turno.codigo_turno}>
                                    <td>{turno.codigo_turno}</td>
                                    <td>{turno.cliente.codigo_cliente}</td>
                                    <td>{turno.fecha_hora}</td>
                                    <td>{turno.tipo_turno}</td>
                                    <td>{turno.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !loading && <p className="text-center">No se encontraron turnos.</p>
                )}
            </div>
        </div>
    );
}

export default Buscadorpage;