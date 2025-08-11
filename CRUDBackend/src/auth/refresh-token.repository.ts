import { RefreshToken } from './refresh-token.entity.js';
import { Cliente } from '../cliente/clientes.entity.js';
import { Peluquero } from '../peluquero/peluqueros.entity.js';
import { EntityManager } from '@mikro-orm/core';


function isCliente(user: Cliente | Peluquero): user is Cliente {
    return (user as Cliente).codigo_cliente !== undefined;
};

export class RefreshTokenRepository  {
    constructor(private readonly em:EntityManager){};

    // Persistir nuevo token con relación contextual
    async add(token: string, user: Cliente | Peluquero):Promise<void>{
        const refreshToken = new RefreshToken();
        refreshToken.token = token;
        if(isCliente(user)){
            refreshToken.cliente = user;
        }else{
            refreshToken.peluquero = user;
        };

        await this.em.persistAndFlush(refreshToken);
    };

    // Buscar token para validación o logout
    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.em.findOne(RefreshToken, { token });
    }

    // Eliminar sin cargar entidad
    async removeByToken(token: string):Promise<void>{
        await this.em.nativeDelete(RefreshToken, { token });
    };

    // Eliminar con entidad cargada
    async removeEntity(entity: RefreshToken):Promise<void>{
        await this.em.removeAndFlush(entity);
    };
};