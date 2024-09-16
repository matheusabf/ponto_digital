import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css'; // Certifique-se de importar o CSS

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
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
        localStorage.setItem('login', 'true'); // Use a real token in production
        const ID = response.data.data[0].ID;
        const username = response.data.data[0].NOME;
        localStorage.setItem('ID_USUARIO', ID);
        localStorage.setItem('NOME', username);
        alert('Login successful');
        navigate('/registrar-ponto'); // Redirect to home page
      } else {
        setError(response.data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Error occurred while logging in');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const query = `
      INSERT INTO USUARIOS (LOGIN, SENHA, NOME)
      VALUES (?, ?)
    `;

    try {
      const response = await axios.post('http://localhost:3001/query', {
        query,
        params: [username, password]
      });

      if (response.data.success) {
        alert('Registration successful');
        setIsRegistering(false); // Switch back to login form
      } else {
        setError(response.data.message || 'Failed to register');
      }
    } catch (err) {
      setError('Error occurred while registering');
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Por favor, crie sua conta' : 'Bem vindo(a), faça login:'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
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
        <button type="submit">{isRegistering ? 'Registrar' : 'Acessar'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <span
        type="button"
        className="btn-switch"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
      </span>
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>
    </div>
  );
};

export default Login;
