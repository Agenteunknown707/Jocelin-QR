// Mostrar historial actual
fetch('/codigos')
  .then((res) => res.json())
  .then((data) => {
    mostrarResultados(data);
  });

function mostrarResultados(data) {
  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = data.map((item) => `
    <div>
      <strong>ID:</strong> ${item.id}<br/>
      <strong>Datos:</strong> ${item.data}<br/>
      <strong>Tipo:</strong> ${item.type}
    </div><hr/>
  `).join('');
}

// Iniciar el lector de QR
const qrResult = document.getElementById('qr-result');

function onScanSuccess(decodedText, decodedResult) {
  qrResult.innerHTML = `<strong>Leído:</strong> ${decodedText}`;

  // Guardar el código en el backend
  fetch('/codigos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json;encoding=utf-8'
    },
    body: JSON.stringify({
      data: decodedText,
      type: 'qr'
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Guardado:', data);
    // Volver a cargar historial
    return fetch('/codigos');
  })
  .then(res => res.json())
  .then(data => mostrarResultados(data));
}

// Configurar el escáner
const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    html5QrCode.start(
      { facingMode: "environment" }, // o devices[0].id
      {
        fps: 10,
        qrbox: 250
      },
      onScanSuccess
    ).catch(err => {
      console.error("Error al iniciar cámara:", err);
    });
  }
}).catch(err => {
  console.error("No se pudo acceder a la cámara:", err);
});
