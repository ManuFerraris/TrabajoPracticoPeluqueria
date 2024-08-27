//Este archivo tiene las funciones para realizar las solicitudes 
//HTTP al backend (GET, POST, PUT, DELETE) para gestionar los peluqueros.

const API_URL = "http://localhost:3000/api/peluqueros"

export const getAllPeluqueros = async () => {
    const response = await fetch(API_URL);
    return response.json();
}

export const getOnePeluquero = async (codigo_peluquero) => {
    const response = await fetch(`${API_URL}/${codigo_peluquero}`);
    return response.json();
}

export const createPeluquero = async (peluquero) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers:{"Content-Type": "application/json",},
        body: JSON.stringify(peluquero),
    });
    return response.json();
}

export const updatePeluquero = async (codigo_peluquero, peluquero) => {
    const response = await fetch(`${API_URL}/${codigo_peluquero}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(peluquero),
    });
    return response.json();
};

export const deletePeluquero = async (codigo_peluquero) => {
    const response = await fetch(`${API_URL}/${codigo_peluquero}`, {
        method: "DELETE",
    });
    return response.json();
};