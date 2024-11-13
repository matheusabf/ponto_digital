import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css'; // Certifique-se de importar o CSS

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate hook for redirection

  const handleLogin = async (e) => {
    e.preventDefault();

    const query = `
      SELECT FIRST 1 * 
      FROM USUARIOS 
      WHERE LOGIN = ? AND SENHA = ?
    `;

    try {
      const response = await axios.post('http://localhost:3001/query', {
        query,
        params: [username, password]
      });

      if (response.data.success) {
        const user = response.data.data[0];
        localStorage.setItem('login', 'true'); // Use a real token in production
        localStorage.setItem('ID_USUARIO', user.ID);
        localStorage.setItem('NOME', user.NOME);
        
        // Verificar se o usuário tem permissão para cadastrar usuários
        const permissionQuery = `
          SELECT *
          FROM PERFIL_ACESSO
          WHERE ID = (SELECT PERFIL_ACESSO FROM USUARIOS WHERE ID = ?)
        `;
        const permissionResponse = await axios.post('http://localhost:3001/query', {
          query: permissionQuery,
          params: [user.ID]
        });
        if (permissionResponse.data.success) {
          const canCreateUser = permissionResponse.data.data[0];
          localStorage.setItem('PERMISSOES', JSON.stringify(canCreateUser));
        } else {
          localStorage.setItem('PERFIL_ACESSO_CADASTRA_USUARIO', 'false');
        }

        alert('Login realizado');
        navigate('/registrar-ponto'); // Redirect to home page
      } else {
        setError(response.data.message || 'Nome ou senha inválido');
      }
    } catch (err) {
      setError('Erro ao realizar login');
    }
  };

  return (
    <div className="login-container">
      {/* Logo no topo */}
      <img src="/logo.png" alt="Logo" className="login-logo" />

      <h2>Bem-vindo(a), faça login:</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Acessar</button>
      </form>
      
      {/* Exibe a mensagem de erro, se houver */}
      {error && <p className="error">{error}</p>}

      {/* Copyright abaixo do botão */}
      <p className="copyright">© 2024 Ponto Digital. Todos os direitos reservados.</p>

      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>
    </div>
  );
};

export default Login;
