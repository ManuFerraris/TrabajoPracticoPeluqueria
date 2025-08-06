export function validarCodigo(codigo: number|string, nombreCampo:string = 'codigo'):string | null{
    const numero = Number(codigo);
    if(!codigo){
        return `El ${nombreCampo} no fue provisto`;
    } else if(isNaN(numero)){
        return `El ${nombreCampo} es inválido`;
    };
    return null;
};