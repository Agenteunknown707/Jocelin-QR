// proyecto/backend/index.js
import express from 'express';
import cors from 'cors';

// Almacenamiento en memoria para los códigos QR
// En un entorno de producción, se recomendaría usar una base de datos
const codigosQR = [
  {
    id: "a1b2c3d4e5f6",
    data: "Ejemplo de código QR",
    type: "qr"
  }
];

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para CORS
app.use(cors());

// Middleware para configurar las cabeceras
app.use((req, res, next) => {
  res.header('Accept', 'application/json;encoding=utf-8');
  res.header('Content-Type', 'application/json;encoding=utf-8');
  next();
});

// GET /codigos - Obtener todos los códigos QR
app.get('/codigos', (req, res) => {
  res.json(codigosQR);
});

// GET /codigos/:id - Obtener un código QR específico
app.get('/codigos/:id', (req, res) => {
  const id = req.params.id;
  const codigo = codigosQR.find(c => c.id === id);
  
  if (!codigo) {
    return res.status(404).json({ mensaje: "Código QR no encontrado" });
  }
  
  res.json(codigo);
});

// POST /codigos - Crear un nuevo código QR
app.post('/codigos', (req, res) => {
  const nuevoCodigo = req.body;
  
  // Validación básica
  if (!nuevoCodigo.id || !nuevoCodigo.data || !nuevoCodigo.type) {
    return res.status(400).json({ mensaje: "Datos incompletos. Se requiere id, data y type" });
  }
  
  // Verificar si ya existe un código con el mismo ID
  const codigoExistente = codigosQR.find(c => c.id === nuevoCodigo.id);
  if (codigoExistente) {
    return res.status(409).json({ mensaje: "Ya existe un código QR con ese ID" });
  }
  
  codigosQR.push(nuevoCodigo);
  res.status(201).json(nuevoCodigo);
});

// DELETE /codigos/:id - Eliminar un código QR
app.delete('/codigos/:id', (req, res) => {
  const id = req.params.id;
  const indice = codigosQR.findIndex(c => c.id === id);
  
  if (indice === -1) {
    return res.status(404).json({ mensaje: "Código QR no encontrado" });
  }
  
  const codigoEliminado = codigosQR.splice(indice, 1)[0];
  res.json(codigoEliminado);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Jocelin QR ejecutándose en el puerto ${PORT}`);
});