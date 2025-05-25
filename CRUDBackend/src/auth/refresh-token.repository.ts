import { em } from '../shared/db/orm.js';
import { RefreshToken } from './refresh-token.entity.js';
import { Cliente } from '../cliente/clientes.entity.js';
import { Peluquero } from '../peluquero/peluqueros.entity.js';
import { FilterQuery } from '@mikro-orm/core';

function isCliente(user: Cliente | Peluquero): user is Cliente {
    return (user as Cliente).codigo_cliente !== undefined;
};

export const RefreshTokenRepository = {
    // Guardar un nuevo refresh token asociado a un cliente o peluquero
    add: async (token: string, user: Cliente | Peluquero) => {
    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    if (isCliente(user)) {
        refreshToken.cliente = user;
    } else {
        refreshToken.peluquero = user;
    }

    await em.persistAndFlush(refreshToken);
    },

    // Eliminar refresh tokens según filtro
    remove: async (filter: FilterQuery<RefreshToken>) => {
        await em.nativeDelete(RefreshToken, filter);
    },
};
