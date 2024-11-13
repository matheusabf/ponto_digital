import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Importando o módulo XLSX
import './index.css';
import { usePerfilAcesso } from '../../Context/PerfilAcessoContexto';

const gerarDiasDoMes = (ano, mes) => {
  const dias = [];
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const data = new Date(ano, mes, dia);
    dias.push(data.toISOString().split('T')[0]);
  }
  return dias;
};

const isoParaTempo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  const segundos = date.getSeconds().toString().padStart(2, '0');
  return `${horas}:${minutos}:${segundos}`;
};

const calcularTotalTrabalhado = (p1, p2, p3, p4) => {
  const tempo1 = new Date(`1970-01-01T${p1}Z`).getTime();  // Hora de entrada
  const tempo2 = new Date(`1970-01-01T${p2}Z`).getTime();  // Hora de saída para o almoço
  const tempo3 = new Date(`1970-01-01T${p3}Z`).getTime();  // Hora de volta do almoço
  const tempo4 = new Date(`1970-01-01T${p4}Z`).getTime();  // Hora de saída
  
  // Calculando o total de milissegundos trabalhados
  const totalMilissegundos = ((tempo4 - tempo1) - (tempo3 - tempo2));

  // Convertendo para horas e minutos
  const horas = Math.floor(totalMilissegundos / 3600000);  // 1 hora = 3600000 ms
  const minutos = Math.floor((totalMilissegundos % 3600000) / 60000);  // 1 minuto = 60000 ms

  // Retornando no formato HH:MM
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
};

const Relatorio = () => {
  const perfilAcesso = usePerfilAcesso(); // Acessa o perfil de acesso do contexto
  const exportaExcel = perfilAcesso?.EXPORTA_EXCEL === true; 
  const [dados, setDados] = useState([]);
  const [diasDoMes, setDiasDoMes] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [usuarios, setUsuarios] = useState([]); // Armazena os usuários
  const [selectedUserId, setSelectedUserId] = useState(localStorage.getItem('ID_USUARIO') || '');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.post('http://localhost:3001/query', {
          query: 'SELECT NOME, ID FROM USUARIOS',
          params: []
        });
        setUsuarios(response.data.data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      }
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUserId) return; // Se não houver ID selecionado, não faz a consulta

      try {
        const primeiroDia = new Date(ano, mes, 1).toISOString().split('T')[0];
        const ultimoDia = new Date(ano, mes + 1, 0).toISOString().split('T')[0];

        const query = `
          SELECT DATA, P1, P2, P3, P4, CARGA_HORARIA, JUSTIFICATIVA
          FROM TABELA_PONTOS
          WHERE ID_USUARIO = ? AND DATA BETWEEN ? AND ?
          ORDER BY DATA
        `;
        const response = await axios.post('http://localhost:3001/query', {
          query: query,
          params: [selectedUserId, primeiroDia, ultimoDia]
        });

        setDados(response.data.data);
        setDiasDoMes(gerarDiasDoMes(ano, mes));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };

    fetchData();
  }, [ano, mes, selectedUserId]);

  // Função para exportar os dados para Excel
  const exportarParaExcel = () => {
    const wsData = dados.map((registro) => {
      const diaFormatado = registro.DATA.split('T')[0].replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
      const totalTrabalhado = calcularTotalTrabalhado(isoParaTempo(registro.P1), isoParaTempo(registro.P2), isoParaTempo(registro.P3), isoParaTempo(registro.P4));
  
      // Verifique se CARGA_HORARIA não é null ou undefined
      const cargaHoraria = registro.CARGA_HORARIA ? isoParaTempo(registro.CARGA_HORARIA) : '00:00:00';
      
      return {
        Dia: diaFormatado,
        'Dia da Semana': new Date(registro.DATA).toLocaleDateString('pt-BR', { weekday: 'long' }),
        P1: isoParaTempo(registro.P1),
        P2: isoParaTempo(registro.P2),
        P3: isoParaTempo(registro.P3),
        P4: isoParaTempo(registro.P4),
        'Total Trabalhado (Horas)': totalTrabalhado,
        'Carga Horária': cargaHoraria,
        'Horas Devendo': (parseFloat(cargaHoraria.split(':')[0]) - parseFloat(totalTrabalhado)),
        'Horas Extras': (parseFloat(totalTrabalhado) - parseFloat(cargaHoraria.split(':')[0]) < 0 ? '0.00' : (parseFloat(totalTrabalhado) - parseFloat(cargaHoraria.split(':')[0]))),
        Observacao: registro.JUSTIFICATIVA || '',
      };
    });
  
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Ponto');
    
    // Gerar o arquivo Excel e fazer o download
    XLSX.writeFile(wb, 'Relatorio_Ponto.xlsx');
  };

  return (
    <div>
      <div className="hudrelatorio">
        <h1>Relatório de Ponto</h1>
        <div className="selectrelatorio">
          <label htmlFor="mes">Mês:</label>
          <select id="mes" value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{i + 1}</option>
            ))}
          </select>
          <label htmlFor="ano">Ano:</label>
          <select id="ano" value={ano} onChange={(e) => setAno(parseInt(e.target.value))}>
            {[...Array(10).keys()].map(i => (
              <option key={i} value={ano - 5 + i}>{ano - 5 + i}</option>
            ))}
          </select>
          <label htmlFor="usuario">Colaborador:</label>
          <select 
            id="usuario" 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Selecione</option>
            {usuarios.map((usuario) => (
              <option key={usuario.ID} value={usuario.ID}>
                {usuario.NOME}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relatorio">
        {exportaExcel && (
          <button onClick={exportarParaExcel}>Exportar para Excel</button>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Dia da Semana</th>
                <th>Entrada</th>
                <th>Ida Almoco</th>
                <th>Volta Almoco</th>
                <th>Saida</th>
                <th>Total Trabalhado (Horas)</th>
                <th>Carga Horária</th>
                <th>Horas Devendo</th>
                <th>Horas Extras</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {diasDoMes.map((dia) => {
                const registro = dados.find(reg => reg.DATA.split('T')[0] === dia);
                const diaFormatado = dia.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
                const diaSemana = new Date(dia).toLocaleDateString('pt-BR', { weekday: 'long' });
                const CARGA_HORARIA = registro ? isoParaTempo(registro.CARGA_HORARIA) : '';
                const totalTrabalhado = registro ? calcularTotalTrabalhado(isoParaTempo(registro.P1), isoParaTempo(registro.P2), isoParaTempo(registro.P3), isoParaTempo(registro.P4)) : '0.00';

                return (
                  <tr key={dia}>
                    <td>{diaFormatado}</td>
                    <td>{diaSemana}</td>
                    <td>{registro ? isoParaTempo(registro.P1) : ''}</td>
                    <td>{registro ? isoParaTempo(registro.P2) : ''}</td>
                    <td>{registro ? isoParaTempo(registro.P3) : ''}</td>
                    <td>{registro ? isoParaTempo(registro.P4) : ''}</td>
                    <td>{totalTrabalhado}</td>
                    <td>{CARGA_HORARIA}</td>
                    <td>{registro ? (parseFloat(CARGA_HORARIA.split(':')[0]) - parseFloat(totalTrabalhado)).toFixed(2) : ''}</td>
                    <td>{registro ? (parseFloat(totalTrabalhado) - parseFloat(CARGA_HORARIA.split(':')[0]) < 0 ? '0.00' : (parseFloat(totalTrabalhado) - parseFloat(CARGA_HORARIA.split(':')[0])).toFixed(2)) : ''}</td>
                    <td>{registro ? registro.JUSTIFICATIVA : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Relatorio;
