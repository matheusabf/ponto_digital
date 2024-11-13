import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Certifique-se de ter o CSS adequado
import FormularioPerfilAcesso from '../../Components/FormularioPerfilAcesso';  // Importando o modal/formulário

const CadastroPerfilAcesso = () => {
  const [perfis, setPerfis] = useState([]);
  const [editingPerfil, setEditingPerfil] = useState(null); // Guarda o perfil que será editado
  const [showForm, setShowForm] = useState(false); // Controla a exibição do modal

  useEffect(() => {
    // Função para carregar os perfis de acesso do banco
    const loadPerfis = async () => {
      try {
        const response = await axios.post('http://localhost:3001/query', {
          query: `
            SELECT ID, NOME, VISUALIZA_RELATORIO, ATUALIZA_DADOS, CADASTRA_USUARIO, EXPORTA_EXCEL
            FROM PERFIL_ACESSO
          `,
          params: []
        });
        setPerfis(response.data.data); // Atualiza a lista de perfis de acesso
      } catch (error) {
        console.error('Erro ao carregar os perfis de acesso:', error);
      }
    };
    loadPerfis();
  }, []);

  // Função para salvar ou editar um perfil
  const savePerfil = async (perfilData, isEditing = false) => {
    console.log(perfilData);
    try {
      if (isEditing) {
        // Editando os dados na tabela PERFIL_ACESSO
        await axios.post('http://localhost:3001/query', {
          query: `
            UPDATE PERFIL_ACESSO
            SET NOME = ?, VISUALIZA_RELATORIO = ?, ATUALIZA_DADOS = ?, CADASTRA_USUARIO = ?, EXPORTA_EXCEL = ?
            WHERE ID = ?
          `,
          params: [perfilData.NOME, perfilData.VISUALIZA_RELATORIO, perfilData.ATUALIZA_DADOS, perfilData.CADASTRA_USUARIO, perfilData.EXPORTA_EXCEL, perfilData.ID]
        });
      } else {
        // Adicionando um novo perfil na tabela PERFIL_ACESSO
        await axios.post('http://localhost:3001/query', {
          query: `
            INSERT INTO PERFIL_ACESSO (NOME, VISUALIZA_RELATORIO, ATUALIZA_DADOS, CADASTRA_USUARIO, EXPORTA_EXCEL)
            VALUES (?, ?, ?, ?, ?)
          `,
          params: [perfilData.NOME, perfilData.VISUALIZA_RELATORIO, perfilData.ATUALIZA_DADOS, perfilData.CADASTRA_USUARIO, perfilData.EXPORTA_EXCEL]
        });
      }

      // Após salvar, recarrega a lista de perfis
      setShowForm(false);
      setEditingPerfil(null);
      const response = await axios.post('http://localhost:3001/query', {
        query: `
          SELECT ID, NOME, VISUALIZA_RELATORIO, ATUALIZA_DADOS, CADASTRA_USUARIO, EXPORTA_EXCEL
          FROM PERFIL_ACESSO
        `,
        params: []
      });
      setPerfis(response.data.data); // Atualiza a lista de perfis
    } catch (error) {
      console.error('Erro ao salvar o perfil de acesso:', error);
    }
  };

  // Função para cancelar a edição ou adição
  const cancelEdit = () => {
    setShowForm(false);
    setEditingPerfil(null);
    document.body.classList.remove('modal-open'); // Remove a classe para permitir scroll novamente
  };

  // Função para iniciar a edição de um perfil
  const startEditPerfil = (perfil) => {
    setEditingPerfil(perfil);
    setShowForm(true); // Exibe o formulário para edição
    document.body.classList.add('modal-open'); // Adiciona a classe para desabilitar o scroll
  };

  // Função para remover um perfil
  const removePerfil = async (perfilId) => {
    try {
      await axios.post('http://localhost:3001/query', {
        query: `DELETE FROM PERFIL_ACESSO WHERE ID = ?`,
        params: [perfilId]
      });

      // Atualiza a lista de perfis após a remoção
      const response = await axios.post('http://localhost:3001/query', {
        query: `
          SELECT ID, NOME, VISUALIZA_RELATORIO, ATUALIZA_DADOS, CADASTRA_USUARIO, EXPORTA_EXCEL
          FROM PERFIL_ACESSO
        `,
        params: []
      });
      console.log(response);
      setPerfis(response.data.data); // Atualiza a lista de perfis
    } catch (error) {
      console.error('Erro ao remover o perfil de acesso:', error);
    }
  };

  return (
    <div className="relatorio">
      <h1>Cadastro de Perfis de Acesso</h1>
      <button onClick={() => startEditPerfil(null)}>Adicionar Perfil</button>

      {/* Modal para adicionar/editar perfil */}
      {showForm && (
        <div className="popup">
          <FormularioPerfilAcesso
            perfil={editingPerfil}
            onSave={savePerfil}
            onCancel={cancelEdit}
          />
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th> {/* Nova coluna para o nome */}
              <th>Visualiza Relatório</th>
              <th>Atualiza Dados</th>
              <th>Cadastra Usuário</th>
              <th>Exporta Excel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {perfis.map((perfil) => (
              <tr key={perfil.ID}>
                <td>{perfil.ID}</td>
                <td>{perfil.NOME}</td> {/* Exibe o nome do perfil */}
                <td>{perfil.VISUALIZA_RELATORIO == 'T' ? 'Sim' : 'Não'}</td>
                <td>{perfil.ATUALIZA_DADOS == 'T' ? 'Sim' : 'Não'}</td>
                <td>{perfil.CADASTRA_USUARIO == 'T' ? 'Sim' : 'Não'}</td>
                <td>{perfil.EXPORTA_EXCEL == 'T' ? 'Sim' : 'Não'}</td>
                <td>
                  <button onClick={() => startEditPerfil(perfil)}>Editar</button>
                  <button onClick={() => removePerfil(perfil.ID)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CadastroPerfilAcesso;
