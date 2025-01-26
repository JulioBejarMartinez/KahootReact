import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

let socket;

const UnirseAPartida = () => {
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const navigate = useNavigate();

    const handleJoin = async () => {
        try {
            if (!socket) {
                socket = io("http://localhost:4000");
                socket.on('connect', async () => {
                    const jugador = { id: socket.id, nombre };
                    await axios.post(`http://localhost:4000/partidas/${pin}/jugadores`, { jugador });
                    socket.emit('joinRoom', { pin, jugador });
                    navigate(`/SalaPartida/${pin}`);
                });
            }
        } catch (error) {
            console.error('Error al unirse a la partida:', error);
        }
    };

    const handleLeave = () => {
        if (socket) {
            const jugador = { id: socket.id, nombre };
            socket.emit('leaveRoom', { pin, jugador });
            socket.disconnect();
            socket = null;
        }
        navigate('/');
    };

    return (
        <>
            <h1>Unirse a Partida</h1>
            <input
                type="text"
                placeholder="introduzca el Pin de la partida a la que quiere unirse"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
            />
            <input
                type="text"
                placeholder="introduzca su nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <button onClick={handleJoin}>Conectar</button>
            <button onClick={handleLeave}>Salir</button>
        </>
    );
};

export default UnirseAPartida;