const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mehdy2015',
    database: 'DataBasePOPCORN'
});


db.connect((err) => {
   if (err) {
       console.error('Erreur de connexion à la base de données : ' + err.stack);
       return;
   }
   console.log('Connexion à la base de données réussie');
});

module.exports = db;