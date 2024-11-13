import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import FormularioUsuario from '../../Components/FormularioUsuario';  

// Função para limpar a formatação (remover pontos, traços, barras, etc.)
const limparDados = (dados) => {
  return dados.replace(/[^\d]+/g, ''); // Remove qualquer caractere não numérico
};

// Função para aplicar a máscara no CPF
const aplicarMascaraCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Função para aplicar a máscara no Telefone
const aplicarMascaraTelefone = (telefone) => {
  if (!telefone) return '';
  return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const CadastroUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [perfisAcesso, setPerfisAcesso] = useState([]);  // Novo estado para armazenar os perfis de acesso
  const [editingUser, setEditingUser] = useState(null);  
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Função para carregar os usuários e perfis de acesso
    const loadUsuarios = async () => {
      try {
        const usuariosResponse = await axios.post('http://localhost:3001/query', {
          query: `SELECT u.ID, p.NOME, p.EMAIL, p.CPF, p.TELEFONE, p.ID_USUARIO, u.PERFIL_ACESSO, pa.NOME AS PERFIL_ACESSO_NOME
                  FROM USUARIOS u
                  LEFT JOIN PESSOA p ON u.ID = p.ID_USUARIO
                  LEFT JOIN PERFIL_ACESSO pa ON u.PERFIL_ACESSO = pa.ID`,
          params: []
        });
        setUsuarios(usuariosResponse.data.data);

        const perfisResponse = await axios.post('http://localhost:3001/query', {
          query: 'SELECT ID, NOME FROM PERFIL_ACESSO',  // Carregar os perfis de acesso
          params: []
        });
        setPerfisAcesso(perfisResponse.data.data);  // Atualizar o estado com os perfis
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      }
    };
    loadUsuarios();
  }, []);

  // Função para salvar ou editar um usuário
  const saveUser = async (userData, isEditing = false) => {
    try {
      const cpfLimpo = limparDados(userData.CPF);
      const telefoneLimpo = limparDados(userData.TELEFONE);
  
      if (isEditing) {
        // Editando usuário
        await axios.post('http://localhost:3001/query', {
          query: `UPDATE PESSOA SET NOME = ?, EMAIL = ?, CPF = ?, TELEFONE = ? WHERE ID_USUARIO = ?`,
          params: [userData.NOME, userData.EMAIL, cpfLimpo, telefoneLimpo, userData.ID]
        });
  
        // Atualizando o perfil de acesso
        await axios.post('http://localhost:3001/query', {
          query: `UPDATE USUARIOS SET PERFIL_ACESSO = ? WHERE ID = ?`,
          params: [userData.PERFIL_ACESSO, userData.ID]
        });
      } else {
        // Adicionando novo usuário
        const usuarioResponse = await axios.post('http://localhost:3001/query', {
          query: `INSERT INTO USUARIOS (LOGIN, SENHA, PERFIL_ACESSO) VALUES (?, ?, ?) RETURNING ID;`,
          params: [cpfLimpo, cpfLimpo, userData.PERFIL_ACESSO]
        });
  
        const usuarioId = usuarioResponse.data.data.ID;
  
        await axios.post('http://localhost:3001/query', {
          query: `INSERT INTO PESSOA (EMAIL, CPF, TELEFONE, ID_USUARIO, NOME) VALUES (?, ?, ?, ?, ?)`,
          params: [userData.EMAIL, cpfLimpo, telefoneLimpo, usuarioId, userData.NOME]
        });
      }
  
      setShowForm(false);
      setEditingUser(null);
      const response = await axios.post('http://localhost:3001/query', {
        query: `SELECT u.ID, p.NOME, p.EMAIL, p.CPF, p.TELEFONE, p.ID_USUARIO, u.PERFIL_ACESSO, pa.NOME AS PERFIL_ACESSO_NOME
                FROM USUARIOS u
                LEFT JOIN PESSOA p ON u.ID = p.ID_USUARIO
                LEFT JOIN PERFIL_ACESSO pa ON u.PERFIL_ACESSO = pa.ID`,
        params: []
      });
      setUsuarios(response.data.data);  // Atualiza a lista de usuários
    } catch (error) {
      console.error('Erro ao salvar o usuário:', error);
    }
  };
  
  const cancelEdit = () => {
    setShowForm(false);
    setEditingUser(null);
    document.body.classList.remove('modal-open');
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true); 
    document.body.classList.add('modal-open');
  };

  const removeUser = async (userId) => {
    try {
      await axios.post('http://localhost:3001/query', {
        query: `DELETE FROM PESSOA WHERE ID_USUARIO = ?`,
        params: [userId]
      });

      await axios.post('http://localhost:3001/query', {
        query: `DELETE FROM USUARIOS WHERE ID = ?`,
        params: [userId]
      });

      const response = await axios.post('http://localhost:3001/query', {
        query: `SELECT u.ID, p.NOME, p.EMAIL, p.CPF, p.TELEFONE, p.ID_USUARIO, u.PERFIL_ACESSO, pa.NOME AS PERFIL_ACESSO_NOME
                FROM USUARIOS u
                LEFT JOIN PESSOA p ON u.ID = p.ID_USUARIO
                LEFT JOIN PERFIL_ACESSO pa ON u.PERFIL_ACESSO = pa.ID`,
        params: []
      });
      setUsuarios(response.data.data);  
    } catch (error) {
      console.error('Erro ao remover o usuário:', error);
    }
  };

  return (
    <div className="relatorio">
      <h1>Cadastro de Usuarios</h1>
      <button onClick={() => startEditUser(null)}>Adicionar Usuario</button>

      {showForm && (
        <div className="popup">
          <FormularioUsuario
            usuario={editingUser}
            onSave={saveUser}
            onCancel={cancelEdit}
            perfisAcesso={perfisAcesso}  // Passando os perfis de acesso para o formulário
          />
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Perfil Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.ID}>
                <td>{usuario.ID}</td>
                <td>{usuario.NOME}</td>
                <td>{usuario.EMAIL}</td>
                <td>{aplicarMascaraCPF(usuario.CPF)}</td>
                <td>{aplicarMascaraTelefone(usuario.TELEFONE)}</td> {/* Aplica a máscara no telefone */}
                <td>{usuario.PERFIL_ACESSO_NOME}</td>  {/* Exibe o nome do perfil de acesso */}
                <td>
                  <button onClick={() => startEditUser(usuario)}>Editar</button>
                  <button onClick={() => removeUser(usuario.ID)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CadastroUsuarios;
