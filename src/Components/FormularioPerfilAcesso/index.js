import React, { useState, useEffect } from 'react';
import './index.css';

const FormularioPerfilAcesso = ({ perfil, onSave, onCancel }) => {
  // Estado para os campos de entrada, iniciado como objeto vazio
  const [formData, setFormData] = useState({
    NOME: '',
    VISUALIZA_RELATORIO: false,
    ATUALIZA_DADOS: false,
    CADASTRA_USUARIO: false,
    EXPORTA_EXCEL: false
  });

  // Permissões configuradas como chave-valor (campo: nome do campo, tipo de dado)
  const permissaoCampos = [
    { campo: 'VISUALIZA_RELATORIO', label: 'Visualiza Relatório' },
    { campo: 'ATUALIZA_DADOS', label: 'Atualiza Dados' },
    { campo: 'CADASTRA_USUARIO', label: 'Cadastra Usuário' },
    { campo: 'EXPORTA_EXCEL', label: 'Exporta Excel' }
    // Se você adicionar novas permissões, adicione aqui
  ];

  useEffect(() => {
    if (perfil) {
      setFormData({
        NOME: perfil.NOME,
        VISUALIZA_RELATORIO: perfil.VISUALIZA_RELATORIO === 'T',
        ATUALIZA_DADOS: perfil.ATUALIZA_DADOS === 'T',
        CADASTRA_USUARIO: perfil.CADASTRA_USUARIO === 'T',
        EXPORTA_EXCEL: perfil.EXPORTA_EXCEL === 'T'
      });
    }
  }, [perfil]);

  // Função para manipular as mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Função para enviar os dados do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    // Convertendo os valores booleanos para 'T' ou 'F'
    const perfilData = {
      ID: perfil ? perfil.ID : null,
      NOME: formData.NOME,
      VISUALIZA_RELATORIO: formData.VISUALIZA_RELATORIO ? 'T' : 'F',
      ATUALIZA_DADOS: formData.ATUALIZA_DADOS ? 'T' : 'F',
      CADASTRA_USUARIO: formData.CADASTRA_USUARIO ? 'T' : 'F',
      EXPORTA_EXCEL: formData.EXPORTA_EXCEL ? 'T' : 'F'
    };

    console.log(perfilData); // Verifique no console
    onSave(perfilData, perfil ? true : false);
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <div>
        <label>Nome</label>
        <input
          type="text"
          name="NOME"
          value={formData.NOME}
          onChange={handleChange}
        />
      </div>

      {/* Gerar campos dinamicamente com base no mapeamento de permissões */}
      {permissaoCampos.map(({ campo, label }) => (
        <div key={campo}>
          <label>{label}</label>
          <input
            type="checkbox"
            name={campo}
            checked={formData[campo]}
            onChange={handleChange}
          />
        </div>
      ))}

      <div>
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default FormularioPerfilAcesso;
