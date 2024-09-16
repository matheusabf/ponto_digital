import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Certifique-se de importar o CSS

const RegistrarPonto = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');

  // Atualiza a hora atual a cada segundo
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date, brformat=null) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    if(brformat === true){
      return `${day} / ${month} / ${year}`;
    }
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedTime = formatTime(currentTime);
    const date = formatDate(currentTime); // Usa a função formatDate para obter a data no formato YYYY-MM-DD
    const userId = Number(localStorage.getItem('ID_USUARIO'));

    if (!userId) {
      setError('ID do usuário não encontrado no armazenamento local.');
      return;
    }

    const checkQuery = `
      SELECT COALESCE(ID_USUARIO, '0') AS ID_USUARIO, P4
      FROM TABELA_PONTOS
      WHERE ID_USUARIO = ? AND DATA = ?
    `;

    try {
      // Verifica se o registro já existe
      const checkResponse = await axios.post('http://localhost:3001/query', {
        query: checkQuery,
        params: [userId, date]
      });

      const count = checkResponse.data.data[0];
      const data = checkResponse.data.data;
      const p4 = data && data[0] ? data[0]['P4'] || 'F' : 'F';
      console.log(p4);

      console.log(count);
      if(p4 != 'F'){
        alert('Você já adicionou os 4 pontos de hoje!');
      }
      
      if (count != null && p4 === 'F') {
        // Atualize o registro existente
        const updateQuery = `
          UPDATE TABELA_PONTOS
          SET P1 = COALESCE(P1, ?),
              P2 = CASE WHEN P1 IS NOT NULL AND P2 IS NULL THEN ? ELSE P2 END,
              P3 = CASE WHEN P1 IS NOT NULL AND P2 IS NOT NULL AND P3 IS NULL THEN ? ELSE P3 END,
              P4 = CASE WHEN P1 IS NOT NULL AND P2 IS NOT NULL AND P3 IS NOT NULL AND P4 IS NULL THEN ? ELSE P4 END
          WHERE ID_USUARIO = ? AND DATA = ?
        `;
      
        const updateParams = [
          formattedTime,
          formattedTime,
          formattedTime,
          formattedTime,
          userId,
          date
        ];

        const updateResponse = await axios.post('http://localhost:3001/query', {
          query: updateQuery,
          params: updateParams
        });

        if (updateResponse.data.success) {
          alert('Ponto atualizado com sucesso');
        } else {
          setError(updateResponse.data.message || 'Falha ao atualizar ponto');
        }
      } 
      else if (count == null && p4 === 'F'){
        // Insira um novo registro
        const insertQuery = `
          INSERT INTO TABELA_PONTOS (ID_USUARIO, P1, DATA)
          VALUES (?, ?, ?)
        `;

        const insertParams = [userId, formattedTime, date];

        const insertResponse = await axios.post('http://localhost:3001/query', {
          query: insertQuery,
          params: insertParams
        });
        if (insertResponse.data.success) {
          alert('Ponto registrado com sucesso');
        } else {
          setError(insertResponse.data.message || 'Falha ao registrar ponto');
        }
      }
    } catch (err) {
      setError('Erro ao registrar ponto');
      console.error(err); // Log the error for debugging
    }
  };

  return (
    <div className="registrar-container">
      <h1>Assine seu ponto:</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <p>{formatTime(currentTime)}</p>
          <p>{formatDate(currentTime, true)}</p>
        </div>
        <button type="submit">Registrar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default RegistrarPonto;
