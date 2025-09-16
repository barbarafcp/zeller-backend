"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemMsg = void 0;
exports.hasDelinquency = hasDelinquency;
exports.mapHistoryToOpenAI = mapHistoryToOpenAI;
exports.generateMessageForClient = generateMessageForClient;
require("dotenv/config");
const openai_1 = require("openai");
const message_1 = require("../models/message");
exports.systemMsg = {
    role: "system",
    content: `
Actúa como SERGIO, asesor automotriz humano en Chile (no digas que eres IA).
Estilo: WhatsApp, natural, cálido, 1–2 líneas (máximo 220 caracteres). Español chileno.

Tu objetivo en cada respuesta:
1) Reconoce el contexto del cliente y/o su última intención.
2) Sugiere 1 opción concreta (marca+modelo) o haz 1 pregunta clave si faltan datos.
3) Menciona sucursales relevantes SOLO si aporta (máx 1).
4) Cierra con un CTA claro (ej: "¿Te reservo una visita?").

Catálogo permitido (no inventes otros):
- Toyota: Hilux, Corolla
- Hyundai: Tucson, Grand i10
- Nissan: Versa, X-Trail
- Chevrolet: Sail, Tracker
- Peugeot: 208, 3008

Sucursales disponibles: Salfa Automotriz, Aventura Motors, Rosselot.

Financiamiento:
- Si el cliente NO tiene deudas morosas: puedes ofrecer financiamiento.
- Si tiene deudas morosas: NO ofrezcas financiamiento; sugiere alternativas al contado o regularización primero.

Tono:
- Cercano y profesional, sin jerga técnica innecesaria.
- Máx 2 emojis y solo si aportan (no obligatorio).
- Evita párrafos largos; 1–2 líneas como máximo.

No inventes datos, no prometas precios ni stock. Si falta info clave (presupuesto, uso, ciudad), pregunta SOLO 1 cosa.
`
};
function hasDelinquency(debts = [], now = new Date()) {
    return debts.some(d => new Date(d.dueDate).getTime() < now.getTime());
}
function mapHistoryToOpenAI(messages) {
    return messages
        .sort((a, b) => +new Date(a.sentAt) - +new Date(b.sentAt))
        .map(m => m.role === "client"
        ? { role: "user", content: m.text }
        : { role: "assistant", content: m.text });
}
function generateMessageForClient(client) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const name = (_a = client === null || client === void 0 ? void 0 : client.name) !== null && _a !== void 0 ? _a : "cliente";
        const morosa = hasDelinquency((_b = client === null || client === void 0 ? void 0 : client.Debts) !== null && _b !== void 0 ? _b : []);
        const financeFlag = morosa ? "NO_ELEGIBLE_FINANCIAMIENTO" : "ELEGIBLE_FINANCIAMIENTO";
        const history = mapHistoryToOpenAI((_c = client.Messages) !== null && _c !== void 0 ? _c : []).slice(-20);
        console.log("history", history);
        const contextMsg = {
            role: "user",
            content: JSON.stringify({
                client: { id: client.id, name },
                policy: {
                    financing: financeFlag,
                },
                guidance: "Responde en 1–2 líneas, sugiere 1 modelo o 1 pregunta, breve."
            })
        };
        const messages = [exports.systemMsg, contextMsg, ...history];
        // Set up OpenAI client
        const apiKey = (_d = process.env.OPENAI_API_KEY) === null || _d === void 0 ? void 0 : _d.trim();
        if (!apiKey)
            throw new Error("Missing OPENAI_API_KEY");
        const openai = new openai_1.OpenAI({ apiKey });
        // Call model
        const completion = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            max_tokens: 100,
            messages,
        });
        const text = (_j = (_h = (_g = (_f = (_e = completion.choices) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.message) === null || _g === void 0 ? void 0 : _g.content) === null || _h === void 0 ? void 0 : _h.trim()) !== null && _j !== void 0 ? _j : "";
        if (!text)
            throw new Error("No text generated");
        // Persist new agent message
        const now = new Date();
        return yield message_1.Message.create({
            clientId: client.id,
            role: "agent",
            text,
            sentAt: now,
        });
    });
}
