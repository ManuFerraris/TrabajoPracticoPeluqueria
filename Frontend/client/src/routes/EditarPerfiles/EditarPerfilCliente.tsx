import React, {useState, useEffect} from "react";
import { useAuth } from "../../auth/AuthProvider.tsx";
import axios from "axios";
import { API_URL } from "../../auth/constants.ts";

type FormData = {
    dni: string;
    NomyApe: string;
    email: string;
    direccion: string;
    telefono: string;
    password?: string;
};

function EditarPerfilCliente() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        NomyApe:"",
        dni: "",
        direccion:"Sucursal",
        email: "",
        telefono:"",
        password:"",
    });
    const [mensaje, setMensaje] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        async function fetchCliente() {
            try {
                if(user && user.codigo){
                    const response = await axios.get(`${API_URL}/clientes/${user.codigo}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
            
                    const cliente = response.data.data;
                    //console.log("Cliente traido del backend: ", cliente);
                    setFormData({
                        NomyApe: cliente.NomyApe || "",
                        dni: cliente.dni || "",
                        direccion: cliente.direccion || "",
                        email: cliente.email || "",
                        telefono: cliente.telefono || "",
                        password: "",
                    });
                };
            } catch (error:any) {
                console.error("Error al cargar datos del cliente:", error);
                if (error.response?.data?.data?.errores) {
                    const errores = error.response.data.data.errores;
                    setMensaje(errores.join(", "));
                } else {
                    setMensaje("Hubo un error al actualizar el perfil.");
                };
            };
        };
        fetchCliente();
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
                const response = await axios.put(`${API_URL}/clientes/${user.codigo}`, formData, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                //console.log("Respuesta del backend: ", response.data);
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
                    <label className="form-label">Nombre y Apellido</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.NomyApe}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">DNI</label>
                    <input
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Direccion</label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
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
                    <label className="form-label">Telefono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
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

export default EditarPerfilCliente;