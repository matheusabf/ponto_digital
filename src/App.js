// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from './Components/Login';
import PontoDigital from './pages/PontoDigital';
import RegistrarPonto from './rotas/RegistrarPonto';
import MeusDados from './rotas/MeusDados';
import Relatorio from './rotas/Relatorio';
import CadastroUsuarios from './rotas/CadastroUsuarios';
import CadastroPerfilAcesso from './rotas/CadastroPerfilAcesso';
import Customizacoes from './rotas/Customizacoes';

const App = () => (
  <Routes className='routes'>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<PontoDigital />}>
      <Route path="registrar-ponto" element={<RegistrarPonto />} />
      <Route path="meus-dados" element={<MeusDados />} />
      <Route path="relatorio" element={<Relatorio />} />
      <Route path="cadastro-usuarios" element={<CadastroUsuarios />} />
      <Route path="cadastro-perfil-acesso" element={<CadastroPerfilAcesso />} />
      <Route path="customizacoes" element={<Customizacoes />} />
    </Route>
    {/* Outras rotas podem ser adicionadas aqui */}
  </Routes>
);

export default App;
