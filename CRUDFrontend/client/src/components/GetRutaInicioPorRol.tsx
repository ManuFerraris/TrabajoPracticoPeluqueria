export function getRutaInicioPorRol(rol:string):string {
    switch(rol){
        case "admin":
        case "peluquero":
            return "/peluqueros";
        case "cliente":
            return "/homeCliente";
        default:
            return "/login";
    };
};