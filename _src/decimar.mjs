// Decimación agresiva con meshoptimizer usando el flag "Permissive" (colapsa a través de costuras UV).
// Uso: node decimar.mjs <trisObjetivo> <texSize> <salida>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, textureCompress, quantize, reorder } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';

const trisObjetivo = parseInt(process.argv[2] || '25000');
const texSize = parseInt(process.argv[3] || '1024');
const salida = process.argv[4] || '../migue.glb';

await MeshoptSimplifier.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('base_basic_pbr.glb');

for (const mat of doc.getRoot().listMaterials()) {
  mat.setNormalTexture(null); mat.setMetallicRoughnessTexture(null);
  mat.setOcclusionTexture(null); mat.setEmissiveTexture(null);
  mat.setMetallicFactor(0); mat.setRoughnessFactor(0.9);
}
await doc.transform(dedup(), prune(), weld());

// Compacta un primitive: elimina vértices no referenciados por los índices
function compactar(prim) {
  const idx = prim.getIndices(); const arr = idx.getArray();
  const attrs = prim.listSemantics().map(s => prim.getAttribute(s));
  const n = attrs[0].getCount();
  const remap = new Int32Array(n).fill(-1); let k = 0;
  const nuevo = new Uint32Array(arr.length);
  for (let i = 0; i < arr.length; i++) { const v = arr[i]; if (remap[v] < 0) remap[v] = k++; nuevo[i] = remap[v]; }
  for (const acc of attrs) {
    const size = acc.getElementSize(); const src = acc.getArray();
    const dst = new src.constructor(k * size);
    for (let v = 0; v < n; v++) { const r = remap[v]; if (r < 0) continue; for (let c = 0; c < size; c++) dst[r * size + c] = src[v * size + c]; }
    acc.setArray(dst);
  }
  idx.setArray(k <= 65535 ? Uint16Array.from(nuevo) : nuevo);
}

for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION').getArray();
  const idx = Uint32Array.from(prim.getIndices().getArray());
  const antes = idx.length / 3;
  const [nuevoIdx, err] = MeshoptSimplifier.simplify(idx, pos, 3, trisObjetivo * 3, 0.2, ['Permissive', 'Prune']);
  prim.getIndices().setArray(nuevoIdx);
  compactar(prim);
  console.log(`simplify: ${antes} -> ${nuevoIdx.length / 3} tris (error ${err.toFixed(4)})`);
}

await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [texSize, texSize], quality: 82 }),
  quantize(),
  reorder({ encoder: MeshoptEncoder }),
  prune(),
);
await io.write(salida, doc);

let tris = 0, verts = 0;
for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) {
  const i = p.getIndices(); const pos = p.getAttribute('POSITION');
  verts += pos.getCount(); tris += i ? i.getCount() / 3 : pos.getCount() / 3;
}
console.log(`salida: ${salida}  tamaño: ${(fs.statSync(salida).size / 1024).toFixed(0)} KB  tris: ${tris}  verts: ${verts}`);
