const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Usando a porta do ambiente se disponível

// Configuração do pool de conexão para PostgreSQL
const dbOptions = {
  connectionString: 'postgres://default:PASbzC6cMIY2@ep-polished-term-a4w7trp9.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
  ssl: {
    rejectUnauthorized: false, // Use isso apenas se necessário; para evitar erros SSL
  },
};

const pool = new Pool(dbOptions);

app.use(bodyParser.json());
app.use(cors());

// Função para executar a consulta
const executeQuery = (query, params, callback) => {
  pool.query(query, params, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      callback(err, null);
      return;
    }
    callback(null, result.rows); // Retorna apenas as linhas do resultado
  });
};

// Endpoint /query para executar qualquer consulta
app.post('/query', (req, res) => {
  const { query, params } = req.body;

  if (!query) {
    return res.status(400).send('Query parameter is required');
  }

  executeQuery(query, params, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }

    res.json({ success: true, data: result });
  });
});

// Inicializando o servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
