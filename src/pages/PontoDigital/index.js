// src/pages/PontoDigital.js
import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; // Importa Outlet para renderizar rotas filhas
import './index.css';

import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { PerfilAcessoProvider } from '../../Context/PerfilAcessoContexto'; // Importe o provedor

const PontoDigital = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const isLoggedIn = localStorage.getItem('login') === 'true';
    if (!isLoggedIn) {
      // Se não estiver autenticado, redirecione para a página de login
      navigate('/login');
    }
  }, [navigate]);

  return (
    <PerfilAcessoProvider> 
      <div className='container'>
        <Header />
        <main>
          <Outlet /> {/* Renderiza as rotas filhas */}
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </main>
        <Footer />
      </div>
    </PerfilAcessoProvider>
  );
};

export default PontoDigital;
