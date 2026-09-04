// Ensambla index.html: concatena las partes (p*.html) y embebe migue.glb en base64.
import fs from 'node:fs';
const partes = ['p1.html', 'p2a.html', 'p2b1.html', 'p2b2.html', 'p3a.html', 'p3b1.html', 'p3b2.html', 'p3c.html', 'p4a1.html', 'p4a2.html', 'p4b1.html', 'p4b2.html', 'p4c.html'];
const plantilla = partes.map(p => fs.readFileSync(p, 'utf8')).join('');
fs.writeFileSync('index.template.html', plantilla);          // versión legible, sin el modelo embebido
const marcador = '"__GLB_B64__"';
if (!plantilla.includes(marcador)) throw new Error('marcador no encontrado');
const glb = fs.readFileSync('../migue.glb');
const salida = plantilla.replace(marcador, () => JSON.stringify(glb.toString('base64')));
fs.writeFileSync('../index.html', salida);
console.log(`index.template.html: ${(plantilla.length / 1024).toFixed(0)} KB | index.html: ${(fs.statSync('../index.html').size / 1024).toFixed(0)} KB (modelo ${(glb.length / 1024).toFixed(0)} KB)`);
