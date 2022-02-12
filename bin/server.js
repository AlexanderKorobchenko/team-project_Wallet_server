const mongoose = require('mongoose');
const app = require('../app');

const { PORT = 4000, DB_HOST } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful! Server is running on port:${PORT}`,
      );
    });
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  });
