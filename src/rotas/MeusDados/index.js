// src/pages/MeusDados.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MeusDados = () => {
  const [userData, setUserData] = useState({
    login: '',
    nome: '',
    senha: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('ID_USUARIO');
    
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3001/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'SELECT login, nome, senha FROM USUARIOS WHERE ID = ?',
            params: [userId],
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
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
      SET login = ?, nome = ?, senha = ?
      WHERE ID = ?
    `;

    try {
      const response = await axios.post('http://localhost:3001/query', {
        query,
        params: [userData.login, userData.nome, userData.senha, userId],
      });

      if (response.data.success) {
        alert('Dados atualizados com sucesso');
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
    <div>
      <h1>Meus Dados</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login">Login:</label>
          <input
            type="text"
            id="login"
            name="login"
            value={userData.LOGIN}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={userData.NOME}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={userData.SENHA}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          {isEditing ? (
            <>
              <button type="submit">Salvar</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>Editar</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MeusDados;
