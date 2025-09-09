export function getRutaInicioPorRol(rol:string):string {
    switch(rol){
        case "admin":
        case "peluquero":
            return "/peluqueros/homePeluquero";
        case "cliente":
            return "/clientes/homeCliente";
        default:
            return "/login";
    };
};