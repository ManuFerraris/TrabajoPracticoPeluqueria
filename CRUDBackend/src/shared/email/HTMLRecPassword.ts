export function generarHtmlRecuperacion(url:string):string {
    return `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Recuperación de contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href="${url}" style="color: #007bff;">${url}</a>
            <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
        </div>
    `;
};