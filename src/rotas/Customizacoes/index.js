import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const Customizacoes = () => {
  const [selectedTema, setSelectedTema] = useState(null);

  // Função para tratar a seleção de tema e enviar para o backend
  const handleTemaChange = async (temaId) => {
    setSelectedTema(temaId);  // Atualiza o estado com o tema selecionado

    try {
      // Envia o comando de atualização para o backend
      const response = await axios.post('http://localhost:3001/query', {
        query: 'UPDATE CUSTOMIZACAO SET TEMA = ?', // Atualiza o tema para o único registro
        params: [temaId],
      });

      if (response.data.success) {
        alert('Tema atualizado com sucesso!');
      } else {
        alert('Falha ao atualizar tema.');
      }
    } catch (error) {
      console.error('Erro ao enviar a consulta:', error);
      alert('Erro ao atualizar tema.');
    }
  };

  return (
    <div>
      <h3>Escolha o Tema</h3>
      <div className="theme-selector">
        <button 
          className="theme-btn cinza" 
          onClick={() => handleTemaChange(1)} 
          style={{ backgroundColor: 'gray' }}
        >
          Cinza
        </button>
        <button 
          className="theme-btn verde" 
          onClick={() => handleTemaChange(2)} 
          style={{ backgroundColor: 'green' }}
        >
          Verde
        </button>
        <button 
          className="theme-btn roxo" 
          onClick={() => handleTemaChange(3)} 
          style={{ backgroundColor: 'purple' }}
        >
          Roxo
        </button>
        <button 
          className="theme-btn azul" 
          onClick={() => handleTemaChange(4)} 
          style={{ backgroundColor: 'blue' }}
        >
          Azul
        </button>
      </div>
    </div>
  );
};

export default Customizacoes;
