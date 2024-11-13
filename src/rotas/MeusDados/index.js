import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Importando o CSS
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Ícones para mostrar/ocultar senha

const MeusDados = () => {
  const [userData, setUserData] = useState({
    LOGIN: '',
    NOME: '',
    SENHA: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha

  useEffect(() => {
    const userId = localStorage.getItem('ID_USUARIO');

    const fetchUserData = async () => {
      const tryFetch = async (attempts = 3) => {  // Tenta até 3 vezes
        try {
          const response = await fetch('http://localhost:3001/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: 'SELECT LOGIN, NOME, SENHA FROM USUARIOS WHERE ID = ?',
              params: [userId],
            }),
          });
    
          if (!response.ok) {
            if (attempts > 0) {
              console.log(`Tentativa de puxar os dados falhou, tentando novamente em 2 segundos... (Tentativa restante: ${attempts})`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos antes de tentar novamente
              return tryFetch(attempts - 1); // Tenta novamente
            } else {
              throw new Error('Erro ao buscar dados do usuário, todas as tentativas falharam');
            }
          }
    
          const result = await response.json();
          if (result.success && result.data.length > 0) {
            setUserData(result.data[0]);
          } else {
            setError('Nenhum dado de usuário encontrado');
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
    
      setLoading(true);
      await tryFetch(); // Inicia a tentativa
    };
    

    if (userId) {
      fetchUserData();
    } else {
      setError('ID_USUARIO não encontrado no armazenamento local');
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('ID_USUARIO');

    const query = `
      UPDATE USUARIOS
      SET LOGIN = ?, NOME = ?, SENHA = ?
      WHERE ID = ?
    `;

    try {
      const response = await axios.post('http://localhost:3001/query', {
        query,
        params: [userData.LOGIN, userData.NOME, userData.SENHA, userId],
      });

      if (response.data.success) {
        alert('Dados atualizados com sucesso');
        localStorage.setItem('NOME', userData.NOME);
        setIsEditing(false);
      } else {
        setError(response.data.message || 'Falha ao atualizar dados');
      }
    } catch (err) {
      setError('Erro ao atualizar dados');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="meus-dados-container">
      <h1 className="titulo">Meus Dados</h1>
      <form className="dados-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <span className="naoedita">Login: {userData.LOGIN}</span>
        </div>
        <div className="input-container">
          <span className="naoedita">Nome: {userData.NOME}</span>
        </div>
        <div className="input-container">
          <label htmlFor="SENHA">SENHA:</label>
          <div className="senha-container">
            <input
              type={showPassword ? 'text' : 'password'} // Alterna entre 'text' e 'password'
              id="SENHA"
              name="SENHA"
              value={userData.SENHA} 
              onChange={handleChange}
              disabled={!isEditing} 
              className="input"
            />
            <span 
              className="eye-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Ícone de olho */}
            </span>
          </div>
        </div>
        <div className="button-container">
          {isEditing ? (
            <>
              <button type="submit" className="button">Salvar</button>
              <button type="button" onClick={() => setIsEditing(false)} className="button">Cancelar</button>
            </>
          ) : (
            <span onClick={() => setIsEditing(true)} className="button">Editar</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default MeusDados;
