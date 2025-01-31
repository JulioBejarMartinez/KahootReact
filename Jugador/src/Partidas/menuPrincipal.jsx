import React from "react";
import { useNavigate} from "react-router-dom"

const MenuPrincipal = () => {

    const navega = useNavigate()

    const unirseAPartida = async () => {
        navega("/unirseAPartida")
    }

    const crearSala = async () => {
        navega("/crearSala")
    }

    return (
        <>
        <h1>Juega a Kahoot</h1>
        <div className="card text-white bg-dark mb-3" style={{maxWidth: "20rem" , display: "inline-block", margin: "10px"}}>  
            <button onClick={crearSala} className="btn btn-success btn-lg w-100">Crear sala</button>        
            <hr />
            <button onClick={unirseAPartida} className="btn btn-success btn-lg w-100">Unirse a partida</button>            
        </div>    
        </>
    );
}

export default MenuPrincipal;