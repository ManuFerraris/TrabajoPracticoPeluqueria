import { PrimaryKey } from "@mikro-orm/core";

export abstract class BaseEntity{
    @PrimaryKey()
    codigo?:number
}

//  Esta funcion sera implementada mas adelante cuando cambiemos 
//los nombres de los codigos en la bd por uno generico.
//  Por el momento queda asi.