// api/fapi/[...path].js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const TARGET = 'https://testnet.binancefuture.com';

  // /api/fapi/... -> /fapi/...
  const subpath = req.url.replace(/^\/api/, '');
  const url = TARGET + subpath;

  // salin header kecuali yang bikin ribet upstream
  const headers = { ...req.headers };
  delete headers.host; delete headers['content-length']; delete headers.connection;

  // ambil body mentah (POST/DELETE/…)
  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = Buffer.concat(chunks);
  }

  // forward ke Binance Testnet apa adanya
  const r = await fetch(url, { method: req.method, headers, body });

  // forward balik response-nya juga apa adanya
  const buf = Buffer.from(await r.arrayBuffer());
  res.status(r.status);
  r.headers.forEach((v, k) => res.setHeader(k, v));
  res.send(buf);
}
