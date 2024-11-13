const express = require('express');
const Firebird = require('node-firebird');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

const dbOptions = {
  host: 'localhost',         // Endere�o do servidor Firebird
  port: 3050,                // Porta padr�o do Firebird
  database: 'C:/Users/mathe/Documents/Facul/PontoDigital/Banco/TestePontoDigital.FDB', // Caminho para o banco de dados
  user: 'SYSDBA',            // Usu�rio do Firebird
  password: 'masterkey',     // Senha do Firebird
};

app.use(bodyParser.json());
app.use(cors());

// Fun��o para executar a consulta no Firebird
const executeQuery = (query, params, callback, attempts = 3) => {
  console.log('Executando consulta:', query, params);
  
  // Tentando conectar ao banco de dados
  Firebird.attach(dbOptions, (err, db) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);

      // Se houver tentativas restantes, tenta novamente ap�s 2 segundos
      if (attempts > 0) {
        console.log(`Tentando novamente a conex�o em 2 segundos... Tentativas restantes: ${attempts}`);
        return setTimeout(() => executeQuery(query, params, callback, attempts - 1), 2000);
      }

      return callback(err, null);  // Se n�o houver tentativas restantes, retorna o erro
    }

    // Executando a consulta SQL
    db.query(query, params, (err, result) => {
      db.detach();  // Desvincula a conex�o ap�s a consulta

      if (err) {
        console.error('Erro ao executar a consulta:', err);

        // Se houver tentativas restantes, tenta novamente ap�s 2 segundos
        if (attempts > 0) {
          console.log(`Tentando novamente a consulta em 2 segundos... Tentativas restantes: ${attempts}`);
          return setTimeout(() => executeQuery(query, params, callback, attempts - 1), 2000);
        }

        return callback(err, null);  // Se n�o houver mais tentativas, retorna o erro
      }

      return callback(null, result);  // Retorna o resultado da consulta
    });
  });
};

// Endpoint POST /query para execu��o de consultas SQL
app.post('/query', (req, res) => {
  console.log('Recebendo consulta...');
  const { query, params } = req.body;

  // Verifica se a query foi passada corretamente
  if (!query) {
    return res.status(400).json({ error: 'Par�metro "query" � obrigat�rio' });
  }

  // Verifica se os par�metros est�o presentes e s�o um array
  if (params && !Array.isArray(params)) {
    return res.status(400).json({ error: 'Par�metros devem ser passados como um array' });
  }

  // Executa a consulta SQL com a l�gica de retry
  executeQuery(query, params, (err, result) => {
    if (err) {
      console.error('Erro ao executar consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
    }

    // Retorna os resultados da consulta
    return res.json({ success: true, data: result });
  });
});

// Inicia o servidor na porta 3001
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
