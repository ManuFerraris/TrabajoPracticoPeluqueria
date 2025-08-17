import { useNavigate, useLocation } from "react-router-dom";

export const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        if(location.key !== "default"){
            navigate(-1);
        }else{
            navigate("/peluqueros")
        };
    };

    return(
        <button onClick={handleBack} className="back-btn">
            ← Volver
        </button>
    )
};