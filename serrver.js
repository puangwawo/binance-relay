import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.text({ type: "*/*" })); // forward body apa adanya

const TARGET = "https://testnet.binancefuture.com";

app.all("/fapi/*", async (req, res) => {
  try {
    const url = TARGET + req.originalUrl; // /fapi/...
    const headers = { ...req.headers };
    delete headers.host; delete headers["content-length"]; delete headers.connection;

    const r = await fetch(url, {
      method: req.method,
      headers,
      body: ["GET","HEAD"].includes(req.method) ? undefined : req.body
    });

    const txt = await r.text();
    res.status(r.status);
    r.headers.forEach((v,k)=>res.setHeader(k,v));
    res.send(txt);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.get("/", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 3000, () => console.log("relay up"));
