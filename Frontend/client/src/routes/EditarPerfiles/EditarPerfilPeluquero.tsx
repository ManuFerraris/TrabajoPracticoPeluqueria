import React, {useState, useEffect} from "react";
import { useAuth } from "../../auth/AuthProvider.tsx";
import axios from "axios";
import { API_URL } from "../../auth/constants.ts";

type FormData = {
    nombre: string;
    fecha_ingreso: string;
    tipo: string;
    email: string;
    password?: string;
};

function EditarPerfil() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nombre:"",
        fecha_ingreso: "",
        tipo:"Sucursal",
        email: "",
        password:"",
    });
    const [mensaje, setMensaje] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        async function fetchPeluquero() {
            try {
                if(user && user.codigo){
                    const response = await axios.get(`${API_URL}/peluqueros/${user.codigo}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
            
                    const peluquero = response.data.data;
                    console.log("Peluquero traido del backend: ", peluquero);
                    setFormData({
                        nombre: peluquero.nombre || "",
                        fecha_ingreso: peluquero.fecha_Ingreso?.slice(0, 10) || "",
                        tipo: peluquero.tipo || "Sucursal",
                        email: peluquero.email || "",
                        password: "",
                    });
                };
            } catch (error:any) {
                console.error("Error al cargar datos del peluquero:", error);
                if (error.response?.data?.data?.errores) {
                    const errores = error.response.data.data.errores;
                    setMensaje(errores.join(", "));
                } else {
                    setMensaje("Hubo un error al actualizar el perfil.");
                };
            };
        };
        fetchPeluquero();
    }, [user, accessToken]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload: FormData = { ...formData };
            if (!formData.password.trim()) {
                delete payload.password;
            }
            if(user){
                const response = await axios.put(`${API_URL}/peluqueros/${user.codigo}`, formData, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log("Respuesta del backend: ", response.data);
                if(response.status === 200){
                    setMensaje("Cambios guardados correctamente.");
                }else{
                    setMensaje("Error al guardar los cambios.");
                };
            };
        } catch (error: any) {
            console.error("Error al guardar cambios:", error);
            setMensaje("Hubo un error al guardar.");
        } finally {
            setIsLoading(false);
        };
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">Editar Perfil</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Fecha de Ingreso</label>
                    <input
                        type="date"
                        name="fecha_ingreso"
                        value={formData.fecha_ingreso}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="Sucursal">Sucursal</option>
                        <option value="Domicilio">Domicilio</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Contraseña (opcional)</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                        minLength={6}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
                </button>

                {mensaje && <p className="mt-3 text-success">{mensaje}</p>}
            </form>
        </div>
    );
};

export default EditarPerfil;