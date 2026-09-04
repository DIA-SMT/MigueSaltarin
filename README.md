# Migue Saltarín — ¡Al espacio!

Minijuego web tipo *Doodle Jump* en Three.js, en un solo archivo (`index.html`). Migue salta
automáticamente de nube en nube; hay que llegar a los **4.000 m** (el espacio) esquivando tormentas.

## Cómo se juega

- **Solo dos teclas: ← y →.** Mueven a Migue, y también sirven para **empezar** y **reintentar**.
- Si Migue sale por un costado, aparece por el otro.
- Las tormentas (nube gris con rayo) hacen caer a Migue. Caer por debajo de la pantalla = perder.
- Al llegar al espacio (desde ~2.200 m, ver `CFG.ALT_ESPACIO_M`) las nubes pasan a ser rocas espaciales y las tormentas, agujeros negros. Se pisan y se esquivan igual.
- El score es la altura. El cielo cambia con ella: celeste con la ciudad abajo → azul profundo con cirros (700 m) → estratósfera violeta con las primeras estrellas (1.200 m) → casi negro con la Tierra asomando (2.000 m) → espacio (3.000 m). Al llegar a 4.000 m se gana y se muestra altura y tiempo.

## Cómo abrirlo

- **Doble clic en `index.html`** alcanza: el modelo 3D va embebido (base64) dentro del HTML, así que
  funciona sin servidor. Three.js se carga desde CDN (hace falta internet); si no hay conexión,
  usa automáticamente las copias locales de `libs/`.
- Con servidor (opcional): `node _src/servidor.mjs 8765` y abrir <http://localhost:8765>.
  Servido por HTTP, el juego carga `migue.glb` desde el disco (así se puede cambiar el modelo sin
  reconstruir el HTML).

## Música

Poné tu copia de la canción en **`assets/cancion.mp3`** (ruta configurable en `CFG.ARCHIVO_MUSICA`).
Arranca en loop con la primera flecha que se presiona. Si el archivo no existe, suena un riff de rock
generado con WebAudio para que el stand no quede en silencio. `CFG.MUSICA = false` la apaga.

## Ajustes de gameplay

Todo está agrupado al principio del script, en el objeto **`CFG`** (gravedad, fuerza de salto,
separación de nubes, alturas de cada capa, probabilidades de tormentas y nubes móviles, colores del
cielo, volumen, etc.). Cada constante tiene un comentario.

Para revisar rápido una capa sin jugar: abrir la consola del navegador y ejecutar
`MIGUE_DEBUG.teletransportar(3500)` (altura en metros).

## Archivos

| Ruta | Qué es |
|---|---|
| `index.html` | El juego completo (con el modelo embebido, ~875 KB). |
| `migue.glb` | Migue optimizado: 25.000 triángulos, textura 1024 JPEG, 617 KB (el original tenía 1.000.000 y 53 MB). |
| `libs/` | Copias locales de Three.js r147 + GLTFLoader (respaldo sin internet). |
| `assets/` | Acá va `cancion.mp3`. |
| `_src/` | Herramientas de construcción: partes del HTML (`p*.html`), `inyectar.mjs` (arma `index.html`), `decimar.mjs` (optimiza el modelo), `servidor.mjs`. |

## Reconstruir

Editar las partes en `_src/p*.html` (por ejemplo `p2a.html` tiene `CFG`) y correr:

```bash
node _src/inyectar.mjs
```

Para volver a generar `migue.glb` desde el modelo original (`_src/base_basic_pbr.glb`, requiere
`npm i` dentro de `_src`):

```bash
cd _src && node decimar.mjs 25000 1024 ../migue.glb
```
