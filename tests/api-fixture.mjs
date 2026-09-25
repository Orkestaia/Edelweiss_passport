import { createServer } from "node:http";
const card = count => ({ firstName: "Daniel", stampsOnCard: count, totalStamps: count, cardsCompleted: count === 10 ? 1 : 0, stamps: Array.from({ length: count }, (_, i) => ({ n: i + 1, stampedAt: "2026-09-25T12:00:00.000Z" })), reward: count === 10 ? { code: "SWISS-7K3QXM", percent: 15, expiresAt: "2026-10-25T12:00:00.000Z" } : null, history: [{ date: "2026-09-25T12:00:00.000Z", stamps: 2 }] });
createServer((req, res) => {
  if (req.url === "/health") { res.end("ok"); return; }
  if (req.headers.authorization !== "Bearer fixture-read-secret") { res.writeHead(401); res.end(); return; }
  const token = req.url?.split("/").pop();
  if (!["a".repeat(43), "b".repeat(43)].includes(token)) { res.writeHead(404); res.end(); return; }
  res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(card(token[0] === "a" ? 4 : 10)));
}).listen(3199, "127.0.0.1");
