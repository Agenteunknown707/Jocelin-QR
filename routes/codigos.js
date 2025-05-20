const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/codigos.json');

const readData = () => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  res.json(readData());
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  const item = data.find((c) => c.id.endsWith(id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Código no encontrado' });
  }
});

router.post('/', (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Tipo de contenido inválido' });
  }

  const { data, type } = req.body;
  if (!data || !type) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const codigos = readData();
  const nuevo = { id: uuidv4(), data, type };
  codigos.push(nuevo);
  writeData(codigos);

  res.status(201).json(nuevo);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let codigos = readData();
  const index = codigos.findIndex((c) => c.id.endsWith(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Código no encontrado' });
  }

  const eliminado = codigos.splice(index, 1);
  writeData(codigos);
  res.json({ eliminado: eliminado[0] });
});

module.exports = router;
