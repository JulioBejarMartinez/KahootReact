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
            <h1>Bienvenido a la aplicación de Jugador</h1>
            <button onClick={unirseAPartida}>Unirse a partida</button>
            <button onClick={crearSala}>Crear sala</button>
        </>
    );
}

export default MenuPrincipal;