import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

let socket;

const SalaPartida = () => {
    const { pin } = useParams();
    const [partida, setPartida] = useState(null);

    useEffect(() => {
        const obtenerPartida = async () => {
            try {
                const resultado = await axios.get(`http://localhost:4000/partidas/${pin}`);
                if (resultado.data.length > 0) {
                    setPartida(resultado.data[0]);
                }
            } catch (error) {
                console.log(error);
            }
        };
        obtenerPartida();

        if (!socket) {
            socket = io("http://localhost:4000");
            socket.on('connect', () => {
                const jugador = { id: socket.id, nombre: 'Jugador', socketId: socket.id };
                socket.emit('joinRoom', { pin, jugador });
            });
        }

        socket.on('newPlayer', (jugador) => {
            setPartida((prevPartida) => ({
                ...prevPartida,
                jugadores: [...prevPartida.jugadores, jugador]
            }));
        });

        socket.on('playerLeft', (jugador) => {
            setPartida((prevPartida) => ({
                ...prevPartida,
                jugadores: prevPartida.jugadores.filter(j => j.id !== jugador.id)
            }));
        });

        return () => {
            socket.off('newPlayer');
            socket.off('playerLeft');
            const jugador = { id: socket.id, nombre: 'Jugador', socketId: socket.id };
            socket.emit('leaveRoom', { pin, jugador });
            socket.disconnect();
            socket = null;
        };
    }, [pin]);

    if (!partida) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <h1>Sala de Partida: {partida.nombre_de_la_sala}</h1>
            <h2>Cuestionario: {partida.cuestionario_nombre}</h2>
            <button>Empezar Partida</button>
            <ul>
                {partida.jugadores.map((jugador) => (
                    <li key={jugador.id}>{jugador.nombre}</li>
                ))}
            </ul>
        </>
    );
};

export default SalaPartida;