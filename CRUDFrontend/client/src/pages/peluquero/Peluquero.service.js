//Este archivo tiene las funciones para realizar las solicitudes 
//HTTP al backend (GET, POST, PUT, DELETE) para gestionar los peluqueros.

//FUNCIONES A IMPLEMENTAR EN EL PELUQUEROLIST -> CODIGO MAS LEGIBLE

const API_URL = "http://localhost:3000/api/peluqueros" //URL base de la API para manejar operaciones con los peluqueros.

export const getAllPeluqueros = async () => { //Realiza el GET y usa el fetch para enciar solicitudes API_URL
    const response = await fetch(API_URL);
    return response.json();
}

export const getOnePeluquero = async (codigo_peluquero) => { //Realiza el GET para obtener un unico peluquero
    const response = await fetch(`${API_URL}/${codigo_peluquero}`);
    return response.json();
}

export const createPeluquero = async (peluquero) => { //Realiza una solicitud POST para crear un nuevo peluquero
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