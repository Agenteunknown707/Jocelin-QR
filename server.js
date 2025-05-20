const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const codigosRoutes = require('./routes/codigos');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(express.static('public'));

app.use('/codigos', codigosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor Jocelin-QR corriendo en http://localhost:${PORT}`);
});
