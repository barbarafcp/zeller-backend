"use strict";
const app = require('./server');
const db = require('./models');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000;
db.sequelize
    .authenticate()
    .then(() => {
    console.log('Connection to database has been established successfully.');
    app.listen(port, (err) => {
        if (err) {
            return console.error('Failed', err);
        }
        console.log(`Listening to port ${port}`);
        return app;
    });
})
    .catch((err) => console.error('Unable to connect to database:', err));
