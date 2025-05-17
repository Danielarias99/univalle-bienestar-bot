import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Información específica del gimnasio en ambos idiomas
const GYM_INFO = {
  es: `
INFORMACIÓN OFICIAL DE GYMBRO:

- PRECIOS Y MEMBRESÍAS:
  * Mensual: $60.000 COP
  * Quincenal: $35.000 COP
  * Día: $10.000 COP
  * Incluye: Acceso completo a zonas y orientación de entrenadores

- HORARIOS:
  * Lunes a Viernes: 5:00am - 9:00pm
  * Sábados: 6:00am - 12:00m
  * Domingos y festivos: Cerrado

- UBICACIÓN Y CONTACTO:
  * Dirección: Calle 123 #45-67, Zarzal
  * Teléfono: +57 3116561249
  * Email: @gymbro@gmail.com
  * Atención: Lun-Sáb en horario establecido
`,
  en: `
OFFICIAL GYMBRO INFORMATION:

- PRICES AND MEMBERSHIPS:
  * Monthly: $60,000 COP
  * Biweekly: $35,000 COP
  * Daily: $10,000 COP
  * Includes: Full access to all areas and trainer guidance

- SCHEDULE:
  * Monday to Friday: 5:00am - 9:00pm
  * Saturday: 6:00am - 12:00pm
  * Sundays and holidays: Closed

- LOCATION AND CONTACT:
  * Address: Calle 123 #45-67, Zarzal
  * Phone: +57 3116561249
  * Email: @gymbro@gmail.com
  * Service hours: Mon-Sat during business hours
`
};

// Función para detectar el idioma
function detectLanguage(text) {
  // Palabras comunes en inglés
  const englishWords = ['hello', 'hi', 'hey', 'good', 'morning', 'afternoon', 'evening', 'night', 'please', 'thanks', 'thank', 'you', 'what', 'where', 'when', 'how', 'why', 'who', 'which', 'can', 'could', 'would', 'will', 'the', 'gym', 'fitness', 'workout', 'training', 'schedule', 'price', 'membership'];
  
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  
  // Contar palabras en inglés
  const englishWordCount = words.filter(word => englishWords.includes(word)).length;
  
  // Si más del 30% de las palabras son en inglés o si contiene "in english please"
  return englishWordCount / words.length > 0.3 || 
         normalizedText.includes('in english') || 
         normalizedText.includes('english please') ||
         normalizedText.includes('speak english');
}

export async function preguntarAGemini(userPrompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Detectar idioma
    const isEnglish = detectLanguage(userPrompt);
    const language = isEnglish ? 'en' : 'es';

    // Contexto específico para el gimnasio en el idioma detectado
    // Actualización de los prompts del sistema según la solicitud del usuario
    const system_prompt_es = `Eres un experto profesional del fitness con conocimientos en entrenamiento físico, nutrición deportiva, fisioterapia y biomedicina. Hablas con seguridad total, sin redirigir al usuario a otros profesionales. Usa un tono directo, profesional, confiado y amigable. Puedes usar emoticones moderadamente 💪🔥🍎.

Responde con precisión y detalle, ofreciendo respuestas de hasta 2 párrafos cuando el tema lo requiera. Siempre da una acción o recomendación clara.

(La detección de idioma ya se maneja externamente, pero la instrucción a Gemini de responder en el idioma del usuario es buena mantenerla)

Funciones: 
- Crear rutinas según objetivos (masa, definición, fuerza, movilidad, etc).
- Dar consejos nutricionales.
- Recomendar ejercicios para rehabilitación o prevención de lesiones.
- Explicar conceptos fisiológicos de forma técnica y simple.
         
IMPORTANTE: Cuando te pregunten sobre horarios, precios, ubicación o cualquier información del gimnasio GymBro,
         DEBES usar EXACTAMENTE la información proporcionada a continuación. NO inventes ni modifiques estos datos:

         ${GYM_INFO.es}

Si la pregunta es sobre esta información específica del gimnasio, responde ÚNICAMENTE con los datos exactos proporcionados arriba.
Para las demás preguntas sobre tus áreas de experticia (fitness, nutrición, fisioterapia, biomedicina), aplica tus conocimientos como se describe en tus funciones.
Si la pregunta no está relacionada con fitness, gimnasio, salud, o tus áreas de experticia, responde amablemente que solo puedes ayudar con esos temas.`;

    const system_prompt_en = `You are a professional fitness expert with knowledge in physical training, sports nutrition, physiotherapy, and biomedicine. You speak with total confidence, without redirecting the user to other professionals. Use a direct, professional, confident, and friendly tone. You can use emojis moderately 💪🔥🍎.

Respond accurately and in detail, offering answers of up to 2 paragraphs when the topic requires it. Always provide a clear action or recommendation.

(Language detection is already handled externally, but instructing Gemini to respond in the user\'s language is good to keep)

Functions:
- Create routines according to objectives (mass, definition, strength, mobility, etc.).
- Give nutritional advice.
- Recommend exercises for rehabilitation or injury prevention.
- Explain physiological concepts in a technical and simple way.

IMPORTANT: When asked about schedules, prices, location, or any information about GymBro gym,
YOU MUST use EXACTLY the information provided below. DO NOT invent or modify this data:

${GYM_INFO.en}

If the question is about this specific gym information, respond ONLY with the exact data provided above.
For other questions within your areas of expertise (fitness, nutrition, physiotherapy, biomedicine), apply your knowledge as described in your functions.
If the question is not related to fitness, gym, health, or your areas of expertise, kindly respond that you can only help with those topics.`;

    const systemContext = isEnglish ? system_prompt_en : system_prompt_es;

    const fullPrompt = `${systemContext}\n\nPregunta del usuario: ${userPrompt}`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: fullPrompt }] }]
    });

    const texto = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return texto || (isEnglish 
      ? 'Sorry, I could not generate a response 😢.'
      : 'Lo siento, no pude generar una respuesta 😢.');
  } catch (error) {
    console.error('Error con la API de Gemini:', error.response?.data || error.message);
    return isEnglish
      ? 'There was an error consulting the AI 🤖. Please try again later.'
      : 'Hubo un error al consultar la IA 🤖. Intenta más tarde.';
  }
}
