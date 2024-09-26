const Firebird = require('node-firebird');

// Configurações de conexão com o Firebird
const dbOptions = {
  connectionString: 'postgres://default:PASbzC6cMIY2@ep-polished-term-a4w7trp9.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
  ssl: {
    rejectUnauthorized: false, // Use isso apenas se necessário; para evitar erros SSL
  },
};

// Função para testar a conexão
const testConnection = () => {
  Firebird.attach(dbOptions, (err, db) => {
    if (err) {
      console.error('Error attaching to the database:', err);
      return;
    }

    // Executa uma consulta simples
    const query = 'SELECT 1 FROM RDB$DATABASE';

    db.query(query, (err, result) => {
      db.detach();
      if (err) {
        console.error('Error executing query:', err);
        return;
      }

      console.log('Query result:', result);
    });
  });
};

// Executa o teste de conexão
testConnection();
