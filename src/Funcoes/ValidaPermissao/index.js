import axios from 'axios';

const validaPermissao = async (ID, permissao) => {
  try {
    const query = `
      SELECT ${permissao} 
      FROM PERFIL_ACESSO 
      WHERE ID = ?
    `;
    const response = await axios.post('http://localhost:3001/query', {
      query,
      params: [ID],
    });

    if (response.data.success) {
      const hasPermission = response.data.data[0][permissao];  // Verifica se a permissão está presente
      return !!hasPermission;  // Retorna true se a permissão existir, senão false
    } else {
      return false;  // Caso não tenha sucesso na resposta, retorna false
    }
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;  // Retorna false em caso de erro
  }
};

export default validaPermissao;
