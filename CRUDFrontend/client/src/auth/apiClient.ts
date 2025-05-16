import { API_URL } from "./constants.ts";

async function fetchWithAuth(
    endpoint: string, 
    options: RequestInit = {}, 
    accessToken: string, 
    refreshToken: string, 
    refreshAuth: () => Promise<boolean>, 
    logout: () => void) {

        options.headers = {
            ...(options.headers && !(options.headers instanceof Headers) ? options.headers : {}), //Asegura que `headers` sea un objeto normal
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };
    
        let response = await fetch(`${API_URL}${endpoint}`, options);

        if (response.status === 401 && refreshToken) {
            console.log("Access token expirado, obteniendo nuevo...");

            const refreshed = await refreshAuth();  //Intenta renovar el token
            if (refreshed) {
            //Convertimos `options.headers` en un objeto plano antes de modificarlo
                if (!(options.headers instanceof Headers)) {
                    options.headers = { ...options.headers, Authorization: `Bearer ${accessToken}` };
                } else {
                    //Si `headers` es un `Headers`, lo convertimos a objeto antes de modificarlo
                    const headersObj = Object.fromEntries(options.headers.entries());
                    headersObj.Authorization = `Bearer ${accessToken}`;
                    options.headers = headersObj;
                }
            return fetch(`${API_URL}${endpoint}`, options); // Reintenta solicitud original
            }

            console.warn("Error al refrescar el token, cerrando sesión...");
            logout();
        };
        return response;
    }

export { fetchWithAuth }