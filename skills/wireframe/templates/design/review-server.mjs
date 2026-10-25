// Servidor de revisión de wireframes y prototipos. Node.js 18+, sin dependencias.
//
//   node .vd/design/review-server.mjs [puerto]
//
// Sirve la carpeta .vd/ en http://127.0.0.1:<puerto>/ y guarda:
// - los comentarios de la barra de revisión en .vd/RF-NNN/review/comments.json,
// - los resultados de las pruebas manuales (design/qa.html) en .vd/RF-NNN/qa/results.json,
// donde el agente los lee y los responde.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4321);
const RF_ID = /^RF-\d{3,}$/;
const EDITABLE = ['comentario', 'estado', 'respuesta'];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const commentsFile = (rf) => path.join(ROOT, rf, 'review', 'comments.json');

async function readComments(rf) {
  try {
    return JSON.parse(await fs.readFile(commentsFile(rf), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeComments(rf, comments) {
  await fs.mkdir(path.dirname(commentsFile(rf)), { recursive: true });
  await fs.writeFile(commentsFile(rf), `${JSON.stringify(comments, null, 2)}\n`);
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('Cuerpo demasiado grande');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function handleComments(req, res, url) {
  const rf = url.searchParams.get('rf');
  const id = url.searchParams.get('id');
  if (!RF_ID.test(rf || '')) return send(res, 400, { error: 'rf inválido' });

  const comments = await readComments(rf);
  if (req.method === 'GET') return send(res, 200, comments);

  if (req.method === 'POST') {
    const input = await readBody(req);
    const comment = {
      id: typeof input.id === 'string' && input.id ? input.id : `c-${Date.now().toString(36)}`,
      rf,
      fase: input.fase,
      pantalla: input.pantalla,
      estado_pantalla: input.estado_pantalla,
      elemento: input.elemento,
      texto_elemento: input.texto_elemento || '',
      comentario: String(input.comentario || '').trim(),
      estado: 'abierto',
      respuesta: '',
      creado: new Date().toISOString(),
    };
    if (!comment.comentario) return send(res, 400, { error: 'comentario vacío' });
    comments.push(comment);
    await writeComments(rf, comments);
    return send(res, 201, comment);
  }

  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return send(res, 404, { error: 'comentario no encontrado' });

  if (req.method === 'PATCH') {
    const input = await readBody(req);
    for (const key of EDITABLE) if (key in input) comments[index][key] = input[key];
    await writeComments(rf, comments);
    return send(res, 200, comments[index]);
  }
  if (req.method === 'DELETE') {
    comments.splice(index, 1);
    await writeComments(rf, comments);
    return send(res, 204, '');
  }
  return send(res, 405, { error: 'método no permitido' });
}

const resultsFile = (rf) => path.join(ROOT, rf, 'qa', 'results.json');

// Resultados de las pruebas manuales: la página de QA lee y reemplaza el archivo completo.
async function handleQa(req, res, url) {
  const rf = url.searchParams.get('rf');
  if (!RF_ID.test(rf || '')) return send(res, 400, { error: 'rf inválido' });

  if (req.method === 'GET') {
    try {
      return send(res, 200, await fs.readFile(resultsFile(rf), 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return send(res, 200, { rondas: [] });
      throw err;
    }
  }
  if (req.method === 'PUT') {
    const input = await readBody(req);
    if (!Array.isArray(input.rondas)) return send(res, 400, { error: 'se esperaba { rondas: [] }' });
    await fs.mkdir(path.dirname(resultsFile(rf)), { recursive: true });
    await fs.writeFile(resultsFile(rf), `${JSON.stringify(input, null, 2)}\n`);
    return send(res, 200, input);
  }
  return send(res, 405, { error: 'método no permitido' });
}

async function handleStatic(req, res, url) {
  let file = path.resolve(ROOT, `.${decodeURIComponent(url.pathname)}`);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, 'Prohibido', 'text/plain');
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const data = await fs.readFile(file);
    return send(res, 200, data, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  } catch {
    return send(res, 404, 'No encontrado', 'text/plain; charset=utf-8');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/__comments') return await handleComments(req, res, url);
    if (url.pathname === '/__qa') return await handleQa(req, res, url);
    if (req.method !== 'GET') return send(res, 405, { error: 'método no permitido' });
    return await handleStatic(req, res, url);
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Revisión en http://127.0.0.1:${PORT}/`);
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  for (const entry of entries.filter((e) => e.isDirectory() && RF_ID.test(e.name))) {
    for (const kind of ['wireframe', 'prototype']) {
      try {
        await fs.access(path.join(ROOT, entry.name, kind, 'index.html'));
        console.log(`  ${entry.name} ${kind}: http://127.0.0.1:${PORT}/${entry.name}/${kind}/`);
      } catch { /* aún no existe */ }
    }
    try {
      await fs.access(path.join(ROOT, entry.name, 'qa', 'plan.json'));
      console.log(`  ${entry.name} qa: http://127.0.0.1:${PORT}/design/qa.html?rf=${entry.name}`);
    } catch { /* aún no existe */ }
  }
});
