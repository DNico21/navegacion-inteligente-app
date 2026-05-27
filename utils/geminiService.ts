const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Eres Sabana Zen, un asistente de bienestar y calma integrado en una app de navegación para la región Sabana Centro de Colombia (Chía, Cajicá, Zipaquirá, Cogua, Nemocón, Bogotá y municipios cercanos).

Tu rol durante el trayecto:
- Reducir el estrés del tráfico con empatía y tranquilidad
- Sugerir técnicas de respiración cortas (4-7-8, respiración cuadrada, etc.)
- Dar afirmaciones positivas cuando el usuario las pida
- Recordar al usuario que su ruta ya está optimizada por la app
- Ser un compañero cálido y amable durante el viaje

Reglas estrictas:
- Respuestas CORTAS: máximo 2-3 oraciones
- Tono siempre cálido, empático y tranquilizador
- Solo en español
- Nunca des consejos médicos ni de seguridad vial
- Si preguntan por rutas específicas, di que la app ya las tiene optimizadas
- Si el usuario dice "Afirmación del día", da una afirmación motivadora breve
- Si el usuario dice "Tips de calma", da 1-2 técnicas de calma rápidas
- Si el usuario dice "¿Cuánto falta?", responde positivamente recordando que la app lo gestiona`;

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendMessageToGemini(
  history: GeminiMessage[],
  userMessage: string,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return 'Configura tu clave de Gemini en el archivo .env para activar el chat con IA.';
  }

  const contents = [
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.75, maxOutputTokens: 150 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() ?? 'No pude generar una respuesta, intenta de nuevo.';
}
