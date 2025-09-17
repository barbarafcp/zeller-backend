# zeller-backend

El backend de producción lo puedes encontrar en: [https://my-zeller-api.onrender.com](https://my-zeller-api.onrender.com)

## Ejecución local
Ahora si quieres correr este backend de forma local. Aqui estan los pasos a seguir:
### 1. Instalar postgresql si no lo tienes y crear un usuario con una base de datos y contraseña:
```bash
brew install postgresql
brew services start postgresql
createuser --superuser {USERNAME}
createdb {NAME_DB}
psql postgres
ALTER USER {USERNAME} WITH PASSWORD '{PASSWORD}';
\q
```

### 2. Crear .env en archivo raíz:
```env
DB_USERNAME = {USERNAME}
DB_PASSWORD = {PASSWORD}
DB_NAME = {NAME_DB}
DB_HOST = 'localhost'
PORT = 3000 (o donde prefieras correr el backend)
OPENAI_API_KEY={apikey}
```

### 3. Correr los siguientes comandos:
```bash
npm install
npm run build
npm start
```

¡Y listo! Funcionando y corriendo.

## Configuración de OpenAI
### 1. Modelo utilizado
Modelo: gpt-4o-mini — elegido por baja latencia y costo con calidad suficiente.
Parámetros: temperature 0 (estabilidad, tono consistente) y max_tokens 100 (1–2 líneas estilo WhatsApp).
Prompting:
System fija la persona (“Sergio”), estilo, brevedad, catálogo permitido y regla de financiamiento.
Context (user JSON) pasa datos runtime: nombre del cliente y financing según morosidad (ELEGIBLE / NO_ELEGIBLE).
Historial real mapeado (client→user, agent→assistant, últimos ~20 turnos).

### 2. Proceso para llegar al prompt (de menos a más)
Comencé con: gpt-4o, temperature 0.7, sin max_tokens, sin historial, esto me daba respuestas útiles pero largas/genéricas y me permitía guardar el mensaje en la db por la extensión.
Entonce comencé a cambiar algunos parámetros: max_tokens 100 y migrar a gpt-4o-mini, que es más corto y rápido.
Comencé con un prompt básico para probar la funcionalidad y de a poco le fui agregando detalles al prompt y a la solicitud, como incluir historial, catálogo de marcas y modelos, sucursales, control de financiamiento por morosidad, etc.

### 3. Ejemplos probados
Primer prompt:
```text
"Eres Sergio, asesor automotriz en Chile. Responde en tono WhatsApp, breve y cercano. " +
"Usa el historial tal cual, no inventes entradas del cliente."
```

Luego de varios intentos:
```text
Actúa como SERGIO, asesor automotriz humano en Chile (no digas que eres IA).
Estilo: WhatsApp, natural, cálido, 1–2 líneas (máximo 220 caracteres). Español chileno.

Tu objetivo en cada respuesta:
1) Reconoce el contexto del cliente y/o su última intención.
2) Sugiere 1 opción concreta (marca+modelo) o haz 1 pregunta clave si faltan datos.
3) Menciona sucursales relevantes SOLO si aporta.
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
- Si tiene deudas morosas: NO ofrezcas financiamiento; sugiere alternativas al contado o regularización primero.

Tono:
- Cercano y profesional.
- Evita párrafos largos; 1–2 líneas como máximo.

No inventes datos, no prometas precios ni stock. Si falta info clave (presupuesto, uso, ciudad), pregunta SOLO 1 cosa.
```