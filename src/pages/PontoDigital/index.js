// src/pages/PontoDigital.js
import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; // Importa Outlet para renderizar rotas filhas
import './index.css'


import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

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
    <div className='container'>

      <Header />
      <main>
        <Outlet />
     <div class="wave"></div>
     <div class="wave"></div>
     <div class="wave"></div>
      </main>
      <Footer />
    </div>
  );
};

export default PontoDigital;
