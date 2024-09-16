const Firebird = require('node-firebird');

// Configurações de conexão com o Firebird
const dbOptions = {
  host: 'localhost',
  port: 3050, // Certifique-se de que a porta está correta
  database: 'C:/Users/mathe/Documents/Facul/PontoDigital/Banco/TestePontoDigital.FDB', // Verifique o caminho
  user: 'SYSDBA',
  password: 'masterkey'
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
