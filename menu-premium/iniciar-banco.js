/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb');

async function run() {
  // O segredo para não dar timeout é forçar a conexão direta!
  const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    // Manda o comando para inicializar o Replica Set
    const result = await client.db('admin').command({ replSetInitiate: {} });
    console.log('🚀 Replica Set Inicializado:', result);
    
  } catch (e) {
    if (e.message.includes('already initialized')) {
      console.log('👍 O Replica Set já estava inicializado!');
    } else {
      console.error('❌ Erro:', e.message);
    }
  } finally {
    await client.close();
  }
}

run();