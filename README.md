# zeller-backend

El backend de producción lo puedes encontrar en: [https://my-zeller-api.onrender.com](https://my-zeller-api.onrender.com)

Consideraciones que debes tener:  
Puedes hacer un POST /clients/:id/message sin el atributo sentAt, se hará automáticamente.  
Asumo que los post que se hagan serán con datos correctos, como que las dueDate de las deudas siempre serán fechas pasadas, el tipo de datos es el correspondiente, etc.  
Los RUT deben ser únicos.  

---

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

---

## Configuración de OpenAI
### 1. Modelo utilizado

**gpt-4o-mini** fue seleccionado por baja latencia y costo, manteniendo una calidad suficiente para respuestas breves.  
**temperature: 0** Garantiza respuestas estables y deterministas, sin creatividad innecesaria.  
**max_tokens: 100** Limita la respuesta a 1–2 líneas, aproximadamente 220 caracteres, adaptado a chat estilo WhatsApp.  

**System prompt** define:  
- La persona que responde (“Sergio”, asesor humano).  
- Estilo: cercano, cálido, breve, español chileno.  
- Catálogo permitido (solo ciertos modelos de autos).  
- Sucursales y reglas de financiamiento según morosidad.  
- Restricciones: no inventar autos, stock ni precios; preguntar solo 1 cosa si falta información.  

**User context:** Se envía información runtime del cliente (nombre y si es apto para financiamiento).  

**Historial de la conversación:** Se mapean los últimos 20 mensajes aprox.  

### 2. Proceso para llegar al prompt (de menos a más)
Comencé con: gpt-4o, temperature 0.7, sin max_tokens, sin historial, esto me daba respuestas útiles pero largas/genéricas y me permitía guardar el mensaje en la db por la extensión.  

Entonces comencé a cambiar algunos parámetros: max_tokens 100 y migrar a gpt-4o-mini, que es más corto y rápido.  

Comencé con un prompt básico para probar la funcionalidad y de a poco le fui agregando detalles al prompt y a la solicitud, como incluir historial, catálogo de marcas y modelos, sucursales, control de financiamiento por morosidad.  


### 3. Ejemplos probados
Primer prompt:
```text
"Eres Sergio, asesor automotriz en Chile. Responde en tono WhatsApp, breve y cercano. " +
"Usa el historial tal cual, no inventes entradas del cliente."
```

Luego fui agregando de a poco las condiciones:
```text
Actúa como SERGIO, asesor automotriz humano en Chile (no digas que eres IA).
Estilo: WhatsApp, natural, cálido, 1–2 líneas (máximo 220 caracteres). Español chileno.

Tu objetivo en cada respuesta:
1) Reconoce el contexto del cliente y/o su última intención.
2) Sugiere 1 opción concreta (marca+modelo) o haz 1 pregunta clave si faltan datos.
3) Menciona sucursales relevantes SOLO si aporta.
4) Siempre lleva a un CTA (ej: "¿Te reservo una visita?").

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
- Máximo 2 emojis
- Evita párrafos largos; 1–2 líneas como máximo.

No inventes datos, no prometas precios ni stock. Si falta info clave (presupuesto, uso, ciudad), pregunta SOLO 1 cosa.
```
Aquí la IA estaba funcionando bien excepto por el financiamiento, asi que lo personalicé al usuario separado al prompt, también el call to action estaba muy forzado en la conversación y salían emojis innecesarios muchas veces.

Asi que quité lo innecesario y quedó:

```text
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

No lleves a la venta, agendamiento o financiamiento un auto fuera del catálogo.

Sucursales disponibles: Salfa Automotriz, Aventura Motors, Rosselot.

Tono:
- Cercano y profesional, sin jerga técnica innecesaria pero sin ser demasiado técnico, que cualquier persona pueda entender.
- Evitar emojis
- Evita párrafos largos; 1–2 líneas como máximo.

No inventes datos, no prometas precios ni stock. Si falta información clave, pregunta SOLO 1 cosa.
```