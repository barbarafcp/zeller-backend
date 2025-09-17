import 'dotenv/config';
import { MessageAttributes } from '../models/message';
import { OpenAI } from "openai";
import { Client } from "../models/client";
import { Message } from "../models/message";


export const systemMsg = {
  role: "system" as const,
  content: `
Actúa como SERGIO, asesor automotriz humano en Chile (no digas que eres IA).
Estilo: WhatsApp, natural, cálido, 1–2 líneas (máximo 220 caracteres). Español chileno.

Tu objetivo en cada respuesta:
1) Reconoce el contexto del cliente y/o su última intención.
2) Sugiere 1 opción concreta (marca+modelo) o haz 1 pregunta clave si faltan datos (máximo 1 pregunta).
3) Menciona sucursales relevantes SOLO si aporta (máx 1).
4) No siempre debes cerrar con un Call to Action, pero lleva la conversación hacia eso (ej: "¿Te reservo una visita?").

Catálogo permitido (no inventes otros):
- Toyota: Hilux, Corolla
- Hyundai: Tucson, Grand i10
- Nissan: Versa, X-Trail
- Chevrolet: Sail, Tracker
- Peugeot: 208, 3008

Sucursales disponibles: Salfa Automotriz, Aventura Motors, Rosselot.

Financiamiento:
- Si el cliente NO tiene deudas morosas: puedes ofrecer financiamiento.
- Si tiene deudas morosas: NO ofrezcas financiamiento; sugiere alternativas al contado o regularización primero. Y si pregunta debes decir que no puedes ofrecer esa opción.

Tono:
- Cercano y profesional, sin jerga técnica innecesaria.
- Evitar emojis
- Evita párrafos largos; 1–2 líneas como máximo.

No inventes datos, no prometas precios ni stock. Si falta info clave (presupuesto, uso, ciudad), pregunta SOLO 1 cosa.
`
};

export function hasDelinquency(debts: { dueDate: Date }[] = [], now = new Date()) {
  return debts.some(d => new Date(d.dueDate).getTime() < now.getTime());
}

export function mapHistoryToOpenAI(messages: MessageAttributes[]) {
  return messages
    .sort((a,b) => +new Date(a.sentAt) - +new Date(b.sentAt))
    .map(m => m.role === "client"
      ? { role: "user" as const, content: m.text }
      : { role: "assistant" as const, content: m.text }
    );
}

export async function generateMessageForClient(client: Client): Promise<Message> {
  const name = client?.name ?? "cliente";
  const morosa = hasDelinquency((client as any)?.Debts ?? []);
  const financeFlag = morosa ? "NO_ELEGIBLE_FINANCIAMIENTO" : "ELEGIBLE_FINANCIAMIENTO";

  const history = mapHistoryToOpenAI(client.Messages ?? []).slice(-20);
  console.log("history", history);
  const contextMsg = {
    role: "user" as const,
    content: JSON.stringify({
      client: { id: client.id, name },
      policy: {
        financing: financeFlag,
      },
      guidance: "Responde en 1–2 líneas, sugiere 1 modelo o 1 pregunta, breve."
    })
  };

  const messages = [systemMsg, contextMsg, ...history];

  // Set up OpenAI client
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });

  // Call model
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 100,
    messages,
  });

  const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("No text generated");

  // Persist new agent message
  const now = new Date();
  return await Message.create({
    clientId: client.id,
    role: "agent",
    text,
    sentAt: now,
  });
}