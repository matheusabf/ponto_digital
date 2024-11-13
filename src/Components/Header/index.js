import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { usePerfilAcesso } from '../../Context/PerfilAcessoContexto'; // Importe o hook
import './index.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para pegar o local (página) atual
  const perfilAcesso = usePerfilAcesso(); // Acessa o perfil de acesso do contexto
  const [menuAdminAberto, setMenuAdminAberto] = useState(false); // Controle de visibilidade do submenu Admin

  const nome = localStorage.getItem('NOME');

  // Verifica se o usuário tem permissão para cadastrar usuários
  const podeCadastrar = perfilAcesso?.CADASTRA_USUARIO === true; 
  const visualizaRelatorio = perfilAcesso?.VISUALIZA_RELATORIO === true;  // Compara com true (booleano)
  const atualizaDados = perfilAcesso?.ATUALIZA_DADOS === true;  // Compara com true (booleano)
  const exportaExcel = perfilAcesso?.EXPORTA_EXCEL === true;  // Condição para verificar se o perfil permite exportar

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redireciona para a página de login
  };

  // Função para adicionar a classe "active" ao link baseado no caminho atual
  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Função para alternar o submenu "Administrador"
  const toggleMenuAdmin = () => {
    setMenuAdminAberto(!menuAdminAberto);
  };

  return (
    <div className="layout">
      {/* Menu Lateral (Sidebar) */}
      <div className="sidebar">
        {/* Links principais */}
        <Link to="registrar-ponto" className={isActive("/registrar-ponto")}>Registrar Ponto</Link>
      
        {visualizaRelatorio && (
          <Link to="relatorio" className={isActive("/relatorio")}>Relatório</Link>
        )}
        {atualizaDados && (
          <Link to="meus-dados" className={isActive("/meus-dados")}>Meus Dados</Link>
        )}

        {/* Submenu Administrador */}
        {podeCadastrar && (
          <div className={`submenu-admin ${menuAdminAberto ? 'active' : ''}`}>
            <div className="menu-item" onClick={toggleMenuAdmin}>
              Administrador
            </div>
            <div className="submenu">
              <Link to="cadastro-usuarios" className={isActive("/cadastro-usuarios")}>Cadastrar Usuários</Link>
              <Link to="cadastro-perfil-acesso" className={isActive("/cadastro-perfil-acesso")}>Cadastrar Perfil de Acesso</Link>
            </div>
          </div>
        )}
        
        {/* Logo no final do Sidebar */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Logo" className="sidebar-logo-img" />
        </div>
      </div>

      <div className="main-content">
        <header className='header'>
          <span className='pontodigital'>Ponto Digital</span>
          
          <span className='bemvindo'>
            Muito bem vindo(a), colaborador: <span className='nome'>{nome}!  </span>, 
            <span className="logout" onClick={handleLogout}>Fazer Logout</span>
          </span>
        </header>

        <div className="content">
        </div>
      </div>
    </div>
  );
};

export default Header;
