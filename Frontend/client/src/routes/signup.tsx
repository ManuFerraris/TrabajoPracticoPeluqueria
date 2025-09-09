import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';
import { API_URL } from '../auth/constants.ts';
import "./signup.css";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { getRutaInicioPorRol } from '../components/GetRutaInicioPorRol.tsx';

export default function Signup() {

    const navigate = useNavigate(); //Hook para la redireccion

    const [formData, setFormData] = useState({
        dni: "",
        NomyApe: "",
        email: "",
        direccion: "",
        telefono: "",
        codigo_localidad: "",
        password: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        // Validación de DNI
        if (!formData.dni) newErrors.dni = 'DNI es requerido';
        else if (!/^\d{7,8}$/.test(formData.dni)) newErrors.dni = 'DNI debe tener 7 u 8 dígitos';
        
        // Validación de Nombre
        if (!formData.NomyApe) newErrors.NomyApe = 'Nombre completo es requerido';
        else if (formData.NomyApe.length < 5) newErrors.NomyApe = 'Mínimo 5 caracteres';
        
        // Validación de Email
        if (!formData.email) newErrors.email = 'Email es requerido';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email no válido';
        
        // Validación de Dirección
        if (!formData.direccion) newErrors.direccion = 'Dirección es requerida';
        
        // Validación de Teléfono
        if (!formData.telefono) newErrors.telefono = 'Teléfono es requerido';
        else if (!/^\d{10,15}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono no válido';
        
        // Validación de Localidad
        if (!formData.codigo_localidad) newErrors.codigo_localidad = 'Localidad es requerida';
        
        // Validación de Contraseña
        if (!formData.password) newErrors.password = 'Contraseña es requerida';
        else if (formData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if(!validateForm()) {
            console.log("Errores de validación:", errors);
            return;
        };

        setIsSubmitting(true);

        try{
            const response = await axios.post(`${API_URL}/clientes/signup`, formData, {
                validateStatus: (status) => status < 400 // Acepta códigos 200 y 201 como éxitos
            });
            
            if (response.status === 201) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Bienvenido!",
                    text: "Usuario creado correctamente",
                    showConfirmButton: false,
                    timer: 1500
                });

                console.log("Respuesta completa del backend:", response.data);
                console.log("accessToken recibido:", response.data?.accessToken);
                console.log("userData recibido:", response.data?.data);

                const userData = response.data?.data; 
                const accessToken = response.data?.accessToken; 
                const refreshToken = response.data?.refreshToken;

                if (!accessToken || !userData) {
                    console.error("Error: El backend envió un accessToken o userData vacío.");
                    return;
                };

                const userDataNormalizado = {
                    ...userData,
                    nombre: userData.NomyApe, // ← normalización del nombre
                    codigo: userData.codigo_cliente // ← esto es clave
                };

                auth.login(accessToken, refreshToken, userDataNormalizado);

                // Redirigir al login o hacer login automático
                if (auth.isAuthenticated) {
                    console.log("Estado de autenticación después del signup:", auth.isAuthenticated);
                    const destino = getRutaInicioPorRol(auth.user?.rol || '');
                    navigate(destino, {replace: true});
                };
            }else{
                console.log("Error al crear el usuario", response.data);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ha ocurrido un problema en el alta.',
                    confirmButtonText: 'Aceptar',
                    position: 'center'
                });
                // Manejar errores específicos del backend
            };
        } catch(error: any){
            console.error("Error al crear usuario:", error.response?.data || error.message);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Ha ocurrido un problema en el alta.",
                confirmButtonText: "Aceptar",
                position: "center"
            });
        } finally {
            setIsSubmitting(false);
        };
    };

    const auth = useAuth();
    
    useEffect(() => {
        if (auth.isAuthenticated) {
        const destino = getRutaInicioPorRol(auth.user?.rol || '');
        navigate(destino, {replace: true});
    };
    },[auth.isAuthenticated, auth.user, navigate]);

    return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="card shadow-lg" style={{ width: '100%', maxWidth: '600px' }}>
                    <div className="card-body p-4">
                        <div className="text-center mb-4">
                            <h2 className="card-title">Registro de Usuario</h2>
                            <p className="text-muted">Complete sus datos para crear una cuenta</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="dni" className="form-label">DNI *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                                        id="dni"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleChange}
                                        placeholder="Ej: 12345678"
                                    />
                                    {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="NomyApe" className="form-label">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.NomyApe ? 'is-invalid' : ''}`}
                                        id="NomyApe"
                                        name="NomyApe"
                                        value={formData.NomyApe}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                    {errors.NomyApe && <div className="invalid-feedback">{errors.NomyApe}</div>}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo Electrónico *</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ejemplo@correo.com"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="direccion" className="form-label">Dirección *</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    placeholder="Ej: Calle Falsa 123"
                                />
                                {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="telefono" className="form-label">Teléfono *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Ej: 1122334455"
                                    />
                                    {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="codigo_localidad" className="form-label">Localidad *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.codigo_localidad ? 'is-invalid' : ''}`}
                                        id="codigo_localidad"
                                        name="codigo_localidad"
                                        value={formData.codigo_localidad}
                                        onChange={handleChange}
                                        placeholder="Ej: Buenos Aires"
                                    />
                                    {errors.codigo_localidad && <div className="invalid-feedback">{errors.codigo_localidad}</div>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label">Contraseña *</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 py-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Registrando...
                                    </>
                                ) : 'Registrarse'}
                            </button>

                            <div className="mt-3 text-center">
                                <p className="text-muted">
                                    ¿Ya tienes una cuenta?{' '}
                                    <a href="/" className="text-decoration-none">Inicia sesión aquí</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
    );
};