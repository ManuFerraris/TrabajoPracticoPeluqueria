//Hace referencia al acceso de la base de datos
//Esta interfaz nos permite que todos los repositorios usen estos elementos
//Con el Promise<~~~> indicamos que el codigo es asincronico
export interface repository<T>{
    findAll(): Promise<T[] | undefined>;
    getOne(item: {codigo: number}): Promise<T | undefined>;
    add(item: T): Promise<T | undefined>;
    update(item: T): Promise<T | undefined>;
    delete(item: {codigo: number}): Promise<T |undefined>;
}