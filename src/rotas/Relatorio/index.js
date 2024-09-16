import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Certifique-se de que o CSS esteja sendo importado

// Função para gerar todos os dias de um mês
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

// Função para converter uma string ISO 8601 em uma string de tempo no formato HH:mm:ss
const isoParaTempo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  const segundos = date.getSeconds().toString().padStart(2, '0');
  return `${horas}:${minutos}:${segundos}`;
};

// Função para converter TIME no formato HH:mm:ss em milissegundos desde a meia-noite
const tempoParaMilissegundos = (tempo) => {
  const [horas, minutos, segundos] = tempo.split(':').map(Number);
  return (horas * 3600 + minutos * 60 + segundos) * 1000; // em milissegundos
};

// Função para calcular o total de horas a partir de uma lista de horários
const calcula_total = (horarios) => {
  const [p1, p2, p3, p4] = horarios.map(tempoParaMilissegundos);
  const totalTrabalhadoMs = (p4 - p1 - (p3 - p2));
  const totalTrabalhadoHoras = totalTrabalhadoMs / (1000 * 3600);
  return totalTrabalhadoHoras;
};

// Função para calcular o total trabalhado
const calcularTotalTrabalhado = (p1, p2, p3, p4) => {
  const total = calcula_total([p1, p2, p3, p4]);
  return total.toFixed(2);
};

// Função para calcular o saldo de horas
const calcularSaldoHoras = (cargaHoraria, totalTrabalhado) => {
  return (cargaHoraria - totalTrabalhado).toFixed(2);
};

// Função para calcular horas extras
const calcularHorasExtras = (saldoHoras) => {
  return saldoHoras < 0 ? (-saldoHoras).toFixed(2) : '0.00';
};

const Relatorio = () => {
  const [dados, setDados] = useState([]);
  const [error, setError] = useState('');
  const [diasDoMes, setDiasDoMes] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [cargaHoraria, setCargaHoraria] = useState(0);
  const userId = localStorage.getItem('ID_USUARIO');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const primeiroDia = new Date(ano, mes, 1).toISOString().split('T')[0];
        const ultimoDia = new Date(ano, mes + 1, 0).toISOString().split('T')[0];

        const query = `
          SELECT DATA, P1, P2, P3, P4, CARGA_HORARIA
          FROM TABELA_PONTOS
          WHERE ID_USUARIO = ? AND DATA BETWEEN ? AND ?
          ORDER BY DATA
        `;
        const response = await axios.post('http://localhost:3001/query', {
          query: query,
          params: [userId, primeiroDia, ultimoDia]
        });

        setDados(response.data.data);
        setCargaHoraria(response.data.data.length > 0 ? isoParaTempo(response.data.data[0].CARGA_HORARIA) : '');

        // Gerar todos os dias do mês selecionado
        setDiasDoMes(gerarDiasDoMes(ano, mes));
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error(err);
      }
    };

    fetchData();
  }, [ano, mes]);

  const handleChangeAno = (event) => {
    setAno(parseInt(event.target.value));
  };
  function converterData(data) {
    const partes = data.split('/');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
  const handleChangeMes = (event) => {
    setMes(parseInt(event.target.value));
  };

  return (
    <div>
      <div className='hudrelatorio'>
        <h1>Relatório de Ponto</h1>
        <div className='selectrelatorio'>
          <label htmlFor="ano">Ano:</label>
          <select id="ano" value={ano} onChange={handleChangeAno}>
            {[...Array(10).keys()].map(i => (
              <option key={i} value={ano - 5 + i}>{ano - 5 + i}</option>
            ))}
          </select>
          <label htmlFor="mes">Mês:</label>
          <select id="mes" value={mes} onChange={handleChangeMes}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="relatorio">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Dia da Semana</th>
                <th>P1</th>
                <th>P2</th>
                <th>P3</th>
                <th>P4</th>
                <th>Total Trabalhado (Horas)</th>
                <th>Carga Horária</th>
                <th>Horas Devendo</th>
                <th>Horas Extras</th>
              </tr>
            </thead>
            <tbody>
              {diasDoMes.map((dia) => {
                const registro = dados.find(reg => reg.DATA.split('T')[0] === dia);
                const diaFormatado = dia.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
                console.log(dia,diaFormatado);
                const diaSemana = new Date(converterData(dia)).toLocaleDateString('pt-BR', { weekday: 'long' });

                const CARGA_HORARIA = registro ? isoParaTempo(registro.CARGA_HORARIA) : '';
                const totalTrabalhado = registro
                  ? calcularTotalTrabalhado(isoParaTempo(registro.P1), isoParaTempo(registro.P2), isoParaTempo(registro.P3), isoParaTempo(registro.P4))
                  : '0.00';
                const cargaHorariaHoras = registro
                  ? parseFloat(isoParaTempo(registro.CARGA_HORARIA).split(':')[0]) + parseFloat(isoParaTempo(registro.CARGA_HORARIA).split(':')[1])/60 + parseFloat(isoParaTempo(registro.CARGA_HORARIA).split(':')[2])/3600
                  : 0;
                const saldoHoras = registro ? calcularSaldoHoras(cargaHorariaHoras, parseFloat(totalTrabalhado)) : '0.00';
                const horasExtras = registro ? calcularHorasExtras(parseFloat(saldoHoras)) : '0.00';
                const saldo = saldoHoras > 0 ? saldoHoras : '0.00';

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
                    <td>{saldo}</td>
                    <td>{horasExtras}</td>
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
