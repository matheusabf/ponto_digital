const express = require('express');
const Firebird = require('node-firebird');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

const dbOptions = {
  host: 'localhost',
  port: 3050,
  database: 'C:/Users/mathe/Documents/Facul/PontoDigital/Banco/TestePontoDigital.FDB',
  user: 'SYSDBA',
  password: 'masterkey',
};

app.use(bodyParser.json());
app.use(cors());

const executeQuery = (query, params, callback) => {
  Firebird.attach(dbOptions, (err, db) => {
    if (err) {
      console.error('Error attaching to the database:', err);
      callback(err, null);
      return;
    }

    db.query(query, params, (err, result) => {
      db.detach();
      if (err) {
        console.error('Error executing query:', err);
        callback(err, null);
        return;
      }
      callback(null, result);
    });
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
