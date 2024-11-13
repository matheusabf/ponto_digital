// src/Context/PerfilAcessoContexto.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Criando o contexto de PerfilAcesso
const PerfilAcessoContext = createContext();

// Provedor de contexto
export const PerfilAcessoProvider = ({ children }) => {
  const [perfilAcesso, setPerfilAcesso] = useState(null);

  useEffect(() => {
    // Recuperando as permissões do localStorage
    const permissoes = JSON.parse(localStorage.getItem('PERMISSOES'));

    if (permissoes) {
      // Convertendo as permissões de 'T'/'F' para booleanos 'true'/'false'
      const permissoesConvertidas = {
        CADASTRA_USUARIO: permissoes.CADASTRA_USUARIO === 'T', // 'T' se torna true
        VISUALIZA_RELATORIO: permissoes.VISUALIZA_RELATORIO === 'T',  // 'F' se torna false
        ATUALIZA_DADOS: permissoes.ATUALIZA_DADOS === 'T',  // 'F' se torna false
        EXPORTA_EXCEL: permissoes.EXPORTA_EXCEL === 'T',  // 'F' se torna false
      };

      setPerfilAcesso(permissoesConvertidas); // Definindo as permissões convertidas no estado
    }
  }, []);

  return (
    <PerfilAcessoContext.Provider value={perfilAcesso}>
      {children}
    </PerfilAcessoContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const usePerfilAcesso = () => {
  const context = useContext(PerfilAcessoContext);
  if (context === undefined) {
    throw new Error('usePerfilAcesso must be used within a PerfilAcessoProvider');
  }
  return context;
};
