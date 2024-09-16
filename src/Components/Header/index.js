// Header.js
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css';

const Header = () => {
  const navigate = useNavigate(); // Chame useNavigate dentro do componente

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redirect to login page
  };
  const nome = localStorage.getItem('NOME');
  return (
    <header className='header'>
    <span className='pontodigital'>Ponto Digital</span>
    <div className="navmenu">
          <Link to="relatorio">Relatório</Link>
          <Link to="registrar-ponto">Registrar Ponto</Link>
          <Link to="meus-dados">Meus Dados</Link>
        </div>
        <span className='bemvindo'>Colaborador: <span className='nome'>{nome}</span>,<span className="logout" onClick={handleLogout}>Fazer Logout</span></span>
    </header>
  );
};

export default Header;
