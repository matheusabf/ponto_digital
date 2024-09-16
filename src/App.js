// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from './Components/Login';
import PontoDigital from './pages/PontoDigital';
import RegistrarPonto from './rotas/RegistrarPonto';
import MeusDados from './rotas/MeusDados';
import Relatorio from './rotas/Relatorio';

const App = () => (
  <Routes className='routes'>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<PontoDigital />}>
      <Route path="registrar-ponto" element={<RegistrarPonto />} />
      <Route path="meus-dados" element={<MeusDados />} />
      <Route path="relatorio" element={<Relatorio />} />
    </Route>
    {/* Outras rotas podem ser adicionadas aqui */}
  </Routes>
);

export default App;
