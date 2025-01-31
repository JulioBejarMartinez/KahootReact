import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

let socket;

const UnirseAPartida = () => {
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [socketInstance, setSocketInstance] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [socketInstance]);

    const handleJoin = async () => {
        try {
            const socket = io("http://localhost:4000");
            setSocketInstance(socket);

            socket.on('connect', () => {
                const jugador = { 
                    id: socket.id, 
                    nombre, 
                    socketId: socket.id,
                    puntos: 0 
                };
                
                socket.emit('joinRoom', { 
                    pin, 
                    jugador 
                });
                
                navigate(`/SalaPartida/${pin}`, { 
                    state: { jugador } 
                });
            });

        } catch (error) {
            console.error('Error al unirse:', error);
        }
    };

    const handleLeave = () => {
        if (socketInstance) {
            socketInstance.emit('leaveRoom', { 
                pin, 
                jugador: { id: socketInstance.id } 
            });
            socketInstance.disconnect();
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