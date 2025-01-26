import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/dist/vapor/bootstrap.min.css";
import './App.css'

import { useState } from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Cuestionarios from './Cuestionarios/cuestionarios'
import FormularioCuestionario from './Cuestionarios/formularioCuestionario'
import FormularioCuestionarioEditar from './Cuestionarios/formularioCuestionarioEditar'
import Opciones from './Cuestionarios/opciones'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Cuestionarios/>} />
          <Route path="/formularioCuestionario" element={<FormularioCuestionario/>} />
          <Route path="/formularioCuestionarioEditar/:id" element={<FormularioCuestionarioEditar/>}/>
          <Route path="/opciones/:id" element={<Opciones/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
