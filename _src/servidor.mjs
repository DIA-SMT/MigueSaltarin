// Servidor estático mínimo para probar el juego (node _src/servidor.mjs [puerto] [carpetaCapturas])
// Además acepta POST /captura?nombre=xxx con un data URL PNG en el cuerpo y lo guarda como xxx.png
// en la carpeta de capturas (solo para generar imágenes de muestra; el juego no lo usa).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const raiz = path.resolve(process.argv[1] ? path.dirname(process.argv[1]) + '/..' : '.');
const puerto = parseInt(process.argv[2] || '8765');
const carpetaCapturas = path.resolve(process.argv[3] || path.join(raiz, 'capturas'));
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.png': 'image/png' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/captura') {
    const nombre = (url.searchParams.get('nombre') || 'captura').replace(/[^a-z0-9_-]/gi, '_');
    const trozos = [];
    req.on('data', t => trozos.push(t));
    req.on('end', () => {
      const dataUrl = Buffer.concat(trozos).toString('utf8');
      const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      fs.mkdirSync(carpetaCapturas, { recursive: true });
      const destino = path.join(carpetaCapturas, nombre + '.png');
      fs.writeFileSync(destino, Buffer.from(b64, 'base64'));
      res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(String(fs.statSync(destino).size));
    });
    return;
  }
  const ruta = decodeURIComponent(url.pathname) === '/' ? 'index.html' : decodeURIComponent(url.pathname);
  fs.readFile(path.join(raiz, ruta), (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(ruta)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(puerto, () => console.log('Sirviendo ' + raiz + ' en http://localhost:' + puerto + ' (capturas en ' + carpetaCapturas + ')'));
