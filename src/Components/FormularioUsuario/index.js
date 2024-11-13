import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask'; // Importa o InputMask
import './index.css';

const FormularioUsuario = ({ usuario, onSave, onCancel, perfisAcesso }) => {
  const [userData, setUserData] = useState({
    NOME: '',
    EMAIL: '',
    CPF: '',
    TELEFONE: '',
    PERFIL_ACESSO: '', // Inicialmente vazio
    ID: '',  // Adicionando o campo ID
  });

  const perfis = Array.isArray(perfisAcesso) ? perfisAcesso : [];

  useEffect(() => {
    if (usuario) {
      setUserData({
        NOME: usuario.NOME,
        EMAIL: usuario.EMAIL,
        CPF: usuario.CPF,
        TELEFONE: usuario.TELEFONE,
        PERFIL_ACESSO: usuario.PERFIL_ACESSO || '',
        ID: usuario.ID, 
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userData, usuario != null); // Envia os dados ao salvar
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      {/* Campo Nome */}
      <div>
        <label>Nome</label>
        <input
          type="text"
          name="NOME"
          value={userData.NOME}
          onChange={handleChange}
        />
      </div>
      
      {/* Campo Email */}
      <div>
        <label>Email</label>
        <input
          type="email"
          name="EMAIL"
          value={userData.EMAIL}
          onChange={handleChange}
        />
      </div>
      
      {/* Campo CPF com máscara */}
      <div>
        <label>CPF</label>
        <InputMask
          mask="999.999.999-99"
          name="CPF"
          value={userData.CPF}
          onChange={handleChange}
          type="text"
        >
          {(inputProps) => <input {...inputProps} />}
        </InputMask>
      </div>
      
      {/* Campo Telefone com máscara */}
      <div>
        <label>Telefone</label>
        <InputMask
          mask="(99) 99999-9999"
          name="TELEFONE"
          type="text"
          value={userData.TELEFONE}
          onChange={handleChange}
        >
          {(inputProps) => <input {...inputProps} />}
        </InputMask>
      </div>

      {/* Campo de Perfil de Acesso */}
      <div>
        <label>Perfil de Acesso</label>
        <select
          name="PERFIL_ACESSO"
          value={userData.PERFIL_ACESSO}
          onChange={handleChange}
        >
          <option value="">Selecione um perfil</option>
          {perfis.map((perfil) => (
            <option key={perfil.ID} value={perfil.ID}>
              {perfil.NOME}
            </option>
          ))}
        </select>
      </div>

      {/* Botões */}
      <div>
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default FormularioUsuario;
