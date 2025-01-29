import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

let socket;

const SalaPartida = () => {
    const { pin } = useParams();
    const location = useLocation();
    const [partida, setPartida] = useState(null);
    const [jugador, setJugador] = useState(location.state?.jugador || null); // Estado para almacenar el jugador
    const [partidaIniciada, setPartidaIniciada] = useState(false);
    const [preguntaActual, setPreguntaActual] = useState(0);

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
            socket.on('connect', async () => {
                if (!jugador) {
                    const nuevoJugador = { id: socket.id, nombre: 'Jugador', socketId: socket.id }; // Definir el nuevo jugador
                    setJugador(nuevoJugador); // Guardar el jugador en el estado
                    await axios.post(`http://localhost:4000/partidas/${pin}/jugadores`, { jugador: nuevoJugador });
                    socket.emit('joinRoom', { pin, jugador: nuevoJugador });
                } else {
                    //await axios.post(`http://localhost:4000/partidas/${pin}/jugadores`, { jugador });
                    socket.emit('joinRoom', { pin, jugador });
                }
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

        socket.on('partidaIniciada', () => {
            setPartidaIniciada(true);
            console.log('La partida ha comenzado');
        });

        return () => {
            socket.off('newPlayer');
            socket.off('playerLeft');
            if (jugador) {
                socket.emit('leaveRoom', { pin, jugador });
            }
            socket.disconnect();
            socket = null;
        };
    }, [pin, jugador]);

    if (!partida) {
        return <div>Cargando...</div>;
    }

    const iniciarPartida = () => {
        socket.emit('startGame', { pin });
        setPartidaIniciada(true);  
    }
    
    const seleccionarOpcion = (esCorrecta) => {
        if(esCorrecta) {
            alert('Respuesta correcta');
        } else {
            alert('Respuesta incorrecta');
        }
        setPreguntaActual((prevPreguntaActual) => prevPreguntaActual + 1);
    }

    return (
        <>
            <h1>Sala de Partida: {partida.nombre_de_la_sala}</h1>
            <h2>Cuestionario: {partida.cuestionario_nombre}</h2>
            {!partidaIniciada ? (
                <button onClick={iniciarPartida}>Empezar Partida</button>
            ) : (
                <div>
                    {preguntaActual < partida.preguntas.length ? (
                        <div>
                            <h3>Pregunta {preguntaActual + 1}:</h3>
                            <h4>{partida.preguntas[preguntaActual].texto}</h4>
                            {partida.preguntas[preguntaActual].opciones.map((opcion) => (
                                <button key={opcion.id} onClick={() => seleccionarOpcion(opcion.es_correcta)}>
                                    {opcion.texto}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <h3>¡Has completado el cuestionario!</h3>
                    )}
                </div>
            )}
            <ul>
                {partida.jugadores.map((jugador) => (
                    <li key={jugador.id}>{jugador.nombre}</li> // Usar id como clave única
                ))}
            </ul>
        </>
    );
};

export default SalaPartida;