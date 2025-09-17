const app = require('./server');
const db = require('./models');
const dotenv = require('dotenv');

dotenv.config();

// Puerto de escucha: usa el definido en .env o 3000 por defecto
const port = process.env.PORT || 3000;

// Verifica la conexión a la base de datos
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to database has been established successfully.');
    app.listen(port, (err: Error | undefined) => {
      if (err) {
        return console.error('Failed', err);
      }
      console.log(`Listening to port ${port}`);
      return app;
    });
  })
  .catch((err: Error) => console.error('Unable to connect to database:', err));