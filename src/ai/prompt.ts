import 'dotenv/config';
import { MessageAttributes } from '../models/message';
import { OpenAI } from "openai";
import { Client } from "../models/client";
import { Message } from "../models/message";

// Prompt base del sistema utilizado en todas las conversaciones.
export const systemMsg = {
  role: "system" as const,
  content: `
Actúa como SERGIO, asesor automotriz humano en Chile (no digas que eres IA).
Estilo: WhatsApp, natural, cálido, 1–2 líneas (máximo 220 caracteres). Español chileno.

Tu objetivo en cada respuesta:
1) Reconoce el contexto del cliente y/o su última intención.
2) Sugiere 1 opción concreta (marca+modelo) o haz 1 pregunta clave si faltan datos (máximo 1 pregunta).
3) Menciona sucursales relevantes SOLO si aporta (máx 1).
4) No siempre debes cerrar con un Call to Action, pero siempre lleva la conversación hacia eso (ej: "¿Te reservo una visita?").

Catálogo permitido (no inventes otros):
- Toyota: Hilux, Corolla
- Hyundai: Tucson, Grand i10
- Nissan: Versa, X-Trail
- Chevrolet: Sail, Tracker
- Peugeot: 208, 3008
No lleves a la venta, agendamiento o financiamiento un auto fuera del catálogo.

Sucursales disponibles: Salfa Automotriz, Aventura Motors, Rosselot.

No inventes datos, no prometas precios ni stock. Si falta información clave, pregunta SOLO 1 cosa.

Usa el nombre del cliente de vez en cuando, no siempre.
`
};

// Verifica si el cliente tiene al menos una deuda.
export function hasDebts(debts: { dueDate: Date }[] = []) {
  return debts.length > 0;
}

// Convierte el historial de mensajes a los roles user y assistant ordenados por fecha
export function mapHistoryToOpenAI(messages: MessageAttributes[]) {
  return messages
    .sort((a,b) => +new Date(a.sentAt) - +new Date(b.sentAt))
    .map(m => m.role === "client"
      ? { role: "user" as const, content: m.text }
      : { role: "assistant" as const, content: m.text }
    );
}

// Genera y guarda un nuevo mensaje del agente para un cliente específico.
export async function generateMessageForClient(client: Client): Promise<Message> {
  const name = client?.name ?? "cliente";

  // Determina la política de financiamiento según si el cliente tiene deudas vencidas
  const morosa = hasDebts((client as any)?.Debts ?? []);

  const financePolicy = morosa
    ? "No puedes ofrecer financiamiento; sugiere alternativas al contado o regularización primero."
    : "Puedes ofrecer financiamiento.";

  // Contamos cuantos mensajes hay del rol "agent"
  const prevAgentCount = await Message.count({ where: { clientId: client.id, role: "agent" } });
  const isFirstAgentMsg = prevAgentCount === 0;

  // Determina que si es el primer mensaje, debe presentarse
  const introduction = isFirstAgentMsg
  ? "Presentate brevemente, por ejemplo: Hola ${name}, yo soy Sergio y seré tu asesor."
  : "";

  // Combina el prompt base con la política específica de este cliente
  const systemMsgForClient = {
    role: "system" as const,
    content: systemMsg.content + "\n\nPolítica específica para este cliente: " + financePolicy + "\n" + introduction
  };

  // Proporciona contexto del cliente para guiar la respuesta del modelo
  const contextMsg = {
    role: "user" as const,
    content: JSON.stringify({
      client: { id: client.id, name },
      guidance: "Responde en 1–2 líneas, sugiere modelos, 1 pregunta o 1 CTA, breve."
    })
  };

  // Solo se toman los últimos 20 mensajes
  const history = mapHistoryToOpenAI(client.Messages ?? []).slice(-20);

  // Combina el prompt base, el contexto del cliente y el historial de conversación
  const messages = [systemMsgForClient, contextMsg, ...history];

  // Verifica que la clave de la API exista antes de llamar al modelo
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });

  // Solicita al modelo una respuesta breve y determinista
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    frequency_penalty: 0.2,
    presence_penalty: 0.2,
    n: 3,
    max_tokens: 100,
    messages,
  });

  const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("No text generated");

  // Crea y guarda el nuevo mensaje del agente en la base de datos
  const now = new Date();
  return await Message.create({
    clientId: client.id,
    role: "agent",
    text,
    sentAt: now,
  });
}