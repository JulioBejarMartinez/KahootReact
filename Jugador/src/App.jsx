import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/dist/vapor/bootstrap.min.css";

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import MenuPrincipal from "./Partidas/menuPrincipal";
import CrearSala from "./Partidas/CrearSala";
import UnirseAPartdida from "./Partidas/unirseAPartida";
import SalaPartida from "./Partidas/SalaPartida";

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MenuPrincipal/>} />
          <Route path="/crearSala" element={<CrearSala/>} />
          <Route path="/unirseAPartida/" element={<UnirseAPartdida/>}/>
          <Route path="/SalaPartida/:pin" element={<SalaPartida />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
