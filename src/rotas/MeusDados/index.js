import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Importando o CSS

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
    <div className="meus-dados-container">
      <h1 className="titulo">Meus Dados</h1>
      <form className="dados-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="login">Login:</label>
          <input
            type="text"
            id="login"
            name="login"
            value={userData.login}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />
        </div>
        <div className="input-container">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={userData.nome}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />
        </div>
        <div className="input-container">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={userData.senha}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />
        </div>
        <div className="button-container">
          {isEditing ? (
            <>
              <button type="submit" className="button">Salvar</button>
              <button type="button" onClick={() => setIsEditing(false)} className="button">Cancelar</button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="button">Editar</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MeusDados;
