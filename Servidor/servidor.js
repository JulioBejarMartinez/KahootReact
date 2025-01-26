import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs, addDoc, collection, query, where, doc, updateDoc } from "firebase/firestore";
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Asegúrate de que esto coincida con el origen de tu cliente
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(express.json());
app.use(cors());
const puerto = 4000;

const db=mysql.createConnection({
    host: 'dam2.colexio-karbo.com',
    port: 3333,
    user: "dam2",
    password: "Ka3b0134679",
    database: "kahoot_jbejar"
})

const firebaseConfig = {
    apiKey: "AIzaSyDBZcL-8thgXMjpwZG5eLUvyKerLP5GiMs",
    authDomain: "prueba1-7c2a2.firebaseapp.com",
    projectId: "prueba1-7c2a2",
    storageBucket: "prueba1-7c2a2.firebasestorage.app",
    messagingSenderId: "346603900815",
    appId: "1:346603900815:web:ce80edc53c4aeb63e485fa"
};

const firebaseApp = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(firebaseApp);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', async ({ pin, jugador }) => {
        socket.join(pin);

        // Actualizar la base de datos con el nuevo jugador
        const q = query(collection(dbFirestore, 'partidas'), where("pin_de_la_sala", "==", pin));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const partidaDoc = querySnapshot.docs[0];
            const partidaData = partidaDoc.data();
            const jugadoresActualizados = [...partidaData.jugadores, { ...jugador, socketId: socket.id }];
            await updateDoc(doc(dbFirestore, 'partidas', partidaDoc.id), { jugadores: jugadoresActualizados });

            // Emitir evento a todos los clientes en la sala
            io.to(pin).emit('newPlayer', jugador);
        }
    });

    socket.on('leaveRoom', async ({ pin, jugador }) => {
        socket.leave(pin);

        // Actualizar la base de datos para eliminar al jugador
        const q = query(collection(dbFirestore, 'partidas'), where("pin_de_la_sala", "==", pin));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const partidaDoc = querySnapshot.docs[0];
            const partidaData = partidaDoc.data();
            const jugadoresActualizados = partidaData.jugadores.filter(j => j.id !== jugador.id);
            await updateDoc(doc(dbFirestore, 'partidas', partidaDoc.id), { jugadores: jugadoresActualizados });

            // Emitir evento a todos los clientes en la sala
            io.to(pin).emit('playerLeft', jugador);
        }
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected');

        // Obtener las salas a las que el socket estaba unido
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

        for (const pin of rooms) {
            // Obtener la partida correspondiente al pin
            const q = query(collection(dbFirestore, 'partidas'), where("pin_de_la_sala", "==", pin));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const partidaDoc = querySnapshot.docs[0];
                const partidaData = partidaDoc.data();

                // Encontrar el jugador desconectado
                const jugadorDesconectado = partidaData.jugadores.find(j => j.socketId === socket.id);
                if (jugadorDesconectado) {
                    // Actualizar la base de datos para eliminar al jugador
                    const jugadoresActualizados = partidaData.jugadores.filter(j => j.socketId !== socket.id);
                    await updateDoc(doc(dbFirestore, 'partidas', partidaDoc.id), { jugadores: jugadoresActualizados });

                    // Emitir evento a todos los clientes en la sala
                    io.to(pin).emit('playerLeft', jugadorDesconectado);
                }
            }
        }
    });
});

app.get('/', (req, res) => {
    res.json('Oh Yeah!')
});

app.put('/partidas', async (req, res) => {
    const collectionName = 'partidas';
    const { nombre_de_la_sala, pin_de_la_sala, cuestionario_id, creador_id, creador_nombre } = req.body;
    const docData = { 
        nombre_de_la_sala, 
        pin_de_la_sala, 
        cuestionario_id,
        jugadores: [{ id: creador_id, nombre: creador_nombre }] // Agregar el creador al array de jugadores
    };
    try {
        await addDoc(collection(dbFirestore, collectionName), docData);
        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Error adding document:', error);
        res.status(500).json({ error: 'Error adding document' });
    }
});

app.get('/partidas/:pin', async (req, res) => {
    const collectionName = 'partidas';
    const pin = req.params.pin;
    const partidas = [];
    try {
        const q = query(collection(dbFirestore, collectionName), where("pin_de_la_sala", "==", pin));
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
            const partida = { id: doc.id, ...doc.data() };
            const cuestionarioId = partida.cuestionario_id;
            const cuestionarioQuery = `SELECT titulo FROM Cuestionarios WHERE id = ${cuestionarioId}`;
            db.query(cuestionarioQuery, (err, data) => {
                if (err) {
                    console.error('Error getting cuestionario:', err);
                    res.status(500).json({ error: 'Error getting cuestionario' });
                    return;
                }
                if (data.length > 0) {
                    partida.cuestionario_nombre = data[0].titulo;
                } else {
                    partida.cuestionario_nombre = 'Cuestionario no encontrado';
                }
                partidas.push(partida);
                if (partidas.length === querySnapshot.docs.length) {
                    res.json(partidas);
                }
            });
        }
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({ error: 'Error getting documents' });
    }
});

app.post('/partidas/:pin/jugadores', async (req, res) => {
    const { pin } = req.params;
    const { jugador } = req.body;
    try {
        const q = query(collection(dbFirestore, 'partidas'), where("pin_de_la_sala", "==", pin));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const partidaDoc = querySnapshot.docs[0];
            const partidaData = partidaDoc.data();
            const jugadoresActualizados = [...partidaData.jugadores, jugador];
            await updateDoc(doc(dbFirestore, 'partidas', partidaDoc.id), { jugadores: jugadoresActualizados });
            res.json({ status: 'ok' });
        } else {
            res.status(404).json({ error: 'Partida no encontrada' });
        }
    } catch (error) {
        console.error('Error actualizando jugadores:', error);
        res.status(500).json({ error: 'Error actualizando jugadores' });
    }
});


app.get('/cuestionarios', (req, res) => {
    const sql = "SELECT * FROM Cuestionarios";
    db.query(sql,(err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/usuarios', (req, res) => {
    const sql = "SELECT * FROM `Usuarios` order by nombre";
    db.query(sql,(err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.put('/cuestionarios', (req, res) => {
    const sql = "INSERT INTO `Cuestionarios` (`titulo`, `creador_id`) VALUES (?, ?)";
    
    const valores=[
        req.body.titulo,
        req.body.creador_id
    ]
    
    db.query(sql,valores,(err,data)=>{
        if(err) return res.json(err);
        return res.json({"status":"ok"});
    })
})

app.put('/cuestionarios/:id', (req, res) => {
    const sql = "UPDATE `Cuestionarios` SET titulo=?, creador_id=? WHERE id=?";
    
    const valores=[
        req.body.titulo,
        req.body.creador_id,
        req.params.id
    ]
    
    db.query(sql,valores,(err,data)=>{
        if(err) return res.json(err);
        return res.json({"status":"ok"});
    })
})

app.delete('/cuestionarios/:id', (req, res) => {
    const sql = "DELETE FROM `Cuestionarios` where id=?";
    
    const valores=[
        req.params.id
    ]
    
    db.query(sql,valores,(err,data)=>{
        if(err) return res.json(err);
        return res.json({"status":"ok"});
    })
})

app.get('/cuestionarios/:id', (req, res) => {
    const sql = "SELECT * FROM `Cuestionarios` where id=?";
    const valores=[
        req.params.id
    ]
    db.query(sql,valores,(err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/preguntas/:id', (req, res) => {
    const sql = "SELECT * FROM Preguntas WHERE cuestionario_id=?";

    const valores=[
        req.params.id
    ]

    db.query(sql,valores,(err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.post('/preguntas', (req, res) => {
    const sql = "INSERT INTO Preguntas (texto, tiempo_respuesta, cuestionario_id) VALUES (?, ?, ?)";
    const valores = [
        req.body.texto,
        req.body.tiempo_respuesta,
        req.body.cuestionario_id
    ];
    db.query(sql, valores, (err, data) => {
        if (err) return res.json(err);
        return res.json({ id: data.insertId, ...req.body });
    });
});

app.put('/preguntas/:id', (req, res) => {
    const sql = "UPDATE Preguntas SET texto=?, tiempo_respuesta=? WHERE id=?";
    const valores = [
        req.body.texto,
        req.body.tiempo_respuesta,
        req.params.id
    ];
    db.query(sql, valores, (err, data) => {
        if (err) return res.json(err);
        return res.json({ "status": "ok" });
    });
});

app.delete('/preguntas/:id', (req, res) => {
    const sql = "DELETE FROM Preguntas WHERE id=?";
    const valores = [
        req.params.id
    ];
    db.query(sql, valores, (err, data) => {
        if (err) return res.json(err);
        return res.json({ "status": "ok" });
    });
});

app.get('/opciones/:id', (req, res) => {
    const sql = "SELECT * FROM Opciones WHERE pregunta_id=?";

    const valores=[
        req.params.id
    ]

    db.query(sql,valores,(err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.post('/opciones', (req, res) => {
    const sql = "INSERT INTO Opciones (texto, es_correcta, pregunta_id) VALUES (?, ?, ?)";
    const valores = [
        req.body.texto,
        req.body.es_correcta,
        req.body.pregunta_id
    ];
    db.query(sql, valores, (err, data) => {
        if (err) return res.json(err);
        return res.json({ id: data.insertId, ...req.body });
    });
});

app.put('/opciones/:id', (req, res) => {
    const sql = "UPDATE Opciones SET texto=?, es_correcta=? WHERE id=?";
    const valores = [
        req.body.texto,
        req.body.es_correcta,
        req.params.id
    ];
    db.query(sql, valores, (err, data) => {
        if (err) return res.json(err);
        return res.json({ "status": "ok" });
    });
});

app.delete('/opciones/:id', (req, res) => {
    const sql = "DELETE FROM Opciones WHERE id=?";
    const valores = [
        req.params.id
    ];
    db.query(sql, valores, (err, data) => {
        if (err) return res.json(err);
        return res.json({ "status": "ok" });
    });
});


server.listen(puerto, () => {
  console.log('Bienvenido amigooooooo')
})