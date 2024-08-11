import mysql from 'mysql2/promise'

//El pool de conexiones permite cantener 
//varias conexiones abiertas al mismo tiempo en espera de que se vayan a utilizar
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user:process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'peluqueria',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000, //60000 milisegundos
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
}) 