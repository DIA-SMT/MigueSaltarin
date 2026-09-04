// Servidor estático mínimo para probar el juego (node _src/servidor.mjs [puerto])
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const raiz = path.resolve(process.argv[1] ? path.dirname(process.argv[1]) + '/..' : '.');
const puerto = parseInt(process.argv[2] || '8765');
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.png': 'image/png' };
http.createServer((req, res) => {
  const p = path.join(raiz, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(puerto, () => console.log('Sirviendo ' + raiz + ' en http://localhost:' + puerto));
