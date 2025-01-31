import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { Container, Row, Col, Card, ListGroup, Button, ProgressBar, Alert } from 'react-bootstrap';

let socket;

const SalaPartida = () => {
    const { pin } = useParams();
    const location = useLocation();
    const [partida, setPartida] = useState(null);
    const [jugador, setJugador] = useState(location.state?.jugador || null); // Estado para almacenar el jugador
    const [partidaIniciada, setPartidaIniciada] = useState(false);
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [respuestas, setRespuestas] = useState({});
    const [todosRespondieron, setTodosRespondieron] = useState(false);

    useEffect(() => {
        const obtenerPartida = async () => {
            try {
                const resultado = await axios.get(`http://localhost:4000/partidas/${pin}`);
                if (resultado.data.length > 0) {
                    setPartida({
                        ...resultado.data[0],
                        preguntas: resultado.data[0].preguntas || []
                    });
                } else {
                    setPartida({ jugadores: [], preguntas: [] });
                }
            } catch (error) {
                console.log(error);
                setPartida({ jugadores: [], preguntas: [] });
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

        /*socket.on('partidaIniciada', () => {
            console.log('La partida ha comenzado');
            setPartidaIniciada(true);
            iniciarTemporizador(partida.preguntas[preguntaActual].tiempo_respuesta);
        });*/

        socket.on('partidaIniciada', () => {
            console.log('La partida ha comenzado');
            setPartidaIniciada(true);
            if (partida && partida.preguntas && partida.preguntas.length > 0) {
                iniciarTemporizador(partida.preguntas[preguntaActual].tiempo_respuesta);
            }
        });

        // Actualizar lista de jugadores en tiempo real
        socket.on('jugadoresActualizados', (nuevosJugadores) => {
            setPartida(prev => ({
                ...prev,
                jugadores: nuevosJugadores
            }));
        });

        socket.on('puntuacionActualizada', ({ jugadorId, puntos }) => {
            setPartida(prev => ({
                ...prev,
                jugadores: prev.jugadores.map(j => 
                    j.id === jugadorId ? { ...j, puntos } : j
                )
            }));
        });

        return () => {
            socket.off('newPlayer');
            socket.off('playerLeft');
            socket.off('puntuacionActualizada');
            if (jugador) {
                socket.emit('leaveRoom', { pin, jugador });
            }
            socket.disconnect();
            socket = null;
        };
    }, []);

    // Añadir listener para sincronizar preguntas
    useEffect(() => {
        socket.on('actualizarPregunta', (nuevaPregunta) => {
            setPreguntaActual(nuevaPregunta);
            setRespuestas({});
            setTodosRespondieron(false);
        });
        
        return () => {
            socket.off('actualizarPregunta');
        };
    }, []);

    useEffect(() => {
        if (partidaIniciada && partida && partida.preguntas) {
            // Verificamos que aún hay preguntas disponibles
            if (preguntaActual < partida.preguntas.length) {
                iniciarTemporizador(partida.preguntas[preguntaActual].tiempo_respuesta);
            }
        }
    }, [preguntaActual, partidaIniciada, partida]);

    useEffect(() => {
        if (partida && partida.jugadores) {
            const jugadoresIds = partida.jugadores.map(j => j.id);
            const respondedores = Object.keys(respuestas);
            const todos = jugadoresIds.every(id => respondedores.includes(id));
            setTodosRespondieron(todos);
        }
    }, [respuestas, partida]);

    const iniciarTemporizador = (tiempo) => {
        setTiempoRestante(tiempo);
        const interval = setInterval(() => {
            setTiempoRestante((prevTiempo) => {
                if (prevTiempo <= 1 || todosRespondieron) {
                    clearInterval(interval);
                    if (preguntaActual < partida.preguntas.length - 1) {
                        // Notificar a todos los jugadores para avanzar
                        socket.emit('siguientePregunta', {
                            pin,
                            nuevaPregunta: preguntaActual + 1
                        });
                    }
                    return 0;
                }
                return prevTiempo - 1;
            });
        }, 1000);
    };

    if (!partida) {
        return <div>Cargando...</div>;
    }

    const iniciarPartida = () => {
        socket.emit('startGame', { pin });
        setPartidaIniciada(true);  
    }
    
    const seleccionarOpcion = async (esCorrecta) => {
        try {
            const incremento = esCorrecta ? 100 : 0; // Ajusta los puntos según tu lógica

            // Registrar respuesta
            setRespuestas(prev => ({
                ...prev,
                [jugador.id]: esCorrecta
            }));

            
            // Actualizar en el backend
            await axios.put(`http://localhost:4000/partidas/${pin}/jugadores/${jugador.id}/puntos`, {
                incremento: incremento
            });
    
            // Actualizar estado local inmediatamente
            setJugador(prev => ({ ...prev, puntos: (prev.puntos || 0) + incremento }));
            
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
        }
    
        // Avanzar a la siguiente pregunta
        setPreguntaActual(prev => prev + 1);
    };

    return (
        <div className="vapor-theme bg-dark text-light min-vh-100 p-4 d-flex">
            <div className="container-fluid d-flex">
                <div className="col-lg-3 d-flex flex-column">
                    <div className="card border-primary glow-primary flex-grow-1">
                        <div className="card-header bg-primary">
                            <h3 className="mb-0">👥 Jugadores</h3>
                        </div>
                        <div className="card-body player-list overflow-auto">
                            {partida.jugadores?.sort((a, b) => b.puntos - a.puntos).map((j) => (
                                <div 
                                    key={j.id}
                                    className="player-item d-flex justify-content-between align-items-center mb-2 p-2 bg-dark-light"
                                >
                                    <span className="badge bg-success fs-5">{j.nombre}</span>
                                    <span className="badge bg-info fs-5">
                                        {j.puntos || 0} pts
                                    </span>
                                    <br />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-lg-9 d-flex flex-column">
                    <div className="card border-primary mb-4 glow-primary">
                        <div className="card-body text-center">
                            <h1 className="display-4 text-neon">
                                🎮 {partida.nombre_de_la_sala}
                            </h1>
                            <h2 className="text-muted h3">
                                📚 {partida.cuestionario_nombre}
                            </h2>
                        </div>
                    </div>

                    <div className="flex-grow-1 d-flex flex-column">
                        {!partidaIniciada ? (
                            <button 
                                className="btn btn-lg btn-block btn-outline-info fs-2 py-3 glow-on-hover"
                                onClick={iniciarPartida}
                            >
                                🚀 Iniciar Partida
                            </button>
                        ) : (
                            <div className="card border-primary glow-primary mb-4 flex-grow-1">
                                <div className="card-body d-flex flex-column">
                                    {preguntaActual < partida.preguntas?.length ? (
                                        <>
                                            <div className="d-flex justify-content-between mb-4">
                                                <h3 className="text-neon">
                                                    ❓ Pregunta {preguntaActual + 1}
                                                </h3>
                                                <div className="badge bg-info fs-5">
                                                    ⏳ {tiempoRestante}s
                                                </div>
                                            </div>
                                            
                                            <div className="progress glow-primary mb-4">
                                                <div 
                                                    className="progress-bar bg-info" 
                                                    style={{ width: `${(tiempoRestante / (partida.preguntas[preguntaActual]?.tiempo_respuesta || 1)) * 100}%` }}
                                                ></div>
                                            </div>

                                            <h4 className="mb-4 text-primary">
                                                {partida.preguntas[preguntaActual]?.texto}
                                            </h4>

                                            <div className="grid-options flex-grow-1 d-flex flex-column justify-content-center">
                                                {partida.preguntas[preguntaActual]?.opciones?.map((opcion) => (
                                                    <button
                                                        key={opcion.id}
                                                        className={`option-btn ${respuestas[jugador.id] !== undefined ? 
                                                            (opcion.es_correcta ? 'btn-success' : 'btn-danger') : 'btn-outline-light'} 
                                                            glow-on-hover mb-2`}
                                                        onClick={() => seleccionarOpcion(opcion.es_correcta)}
                                                        disabled={respuestas[jugador.id] !== undefined}
                                                    >
                                                        {opcion.texto}
                                                        {respuestas[jugador.id] !== undefined && (
                                                            opcion.es_correcta ? ' ✓' : ' ✕'
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {todosRespondieron && (
                                                <div className="alert alert-info mt-4 glow">
                                                    🎉 Todos han respondido!
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="alert alert-success text-center fs-3 glow">
                                            🏆 ¡Cuestionario completado!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaPartida;