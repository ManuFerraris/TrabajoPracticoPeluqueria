interface MensajeProps {
    tipo: 'error' | 'exito';
    texto: string;
};

const Mensaje = ({tipo, texto}:MensajeProps) => {
    return (
        <div className={`mensaje-container ${tipo}`}>
            <p>{texto}</p>
        </div>
    );
};

export default Mensaje;