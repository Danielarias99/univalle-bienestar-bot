# Asistente Virtual de Bienestar Universitario - Universidad del Valle

## 🎓 Descripción

Este es el asistente virtual de WhatsApp para el área de Bienestar Universitario de la Universidad del Valle. El bot proporciona información y servicios relacionados con:

- **Psicología y orientación**: Agendar citas de orientación psicológica, consultar horarios, información sobre servicios
- **Comedor universitario**: Menús del día, horarios, precios, información nutricional

## 🚀 Características

### Servicios de Psicología
- ✅ Agendar citas de orientación psicológica
- ✅ Consultar horarios de atención
- ✅ Información sobre servicios psicológicos disponibles
- ✅ Contacto directo con psicólogos de turno

### Comedor Universitario
- ✅ Consultar menú del día
- ✅ Horarios de servicio (desayuno, almuerzo, cena)
- ✅ Precios y formas de pago
- ✅ Información nutricional
- ✅ Sugerencias y comentarios

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **WhatsApp Business API** - Comunicación por WhatsApp
- **Google Sheets API** - Almacenamiento de datos
- **Google Gemini AI** - Consultas inteligentes (opcional)

## 📋 Requisitos Previos

- Node.js (versión 18.x o superior)
- npm (versión 8.0.0 o superior)
- Cuenta de WhatsApp Business API
- Cuenta de Google Cloud con Google Sheets API habilitada

## ⚙️ Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Danielarias99/bot.git
cd bot
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# WhatsApp Business API
WEBHOOK_VERIFY_TOKEN=tu_webhook_verify_token
API_TOKEN=tu_whatsapp_api_token
BUSINESS_PHONE=tu_numero_de_telefono_business
API_VERSION=v18.0

# Google Sheets API
GOOGLE_CREDENTIALS_BASE64=tu_credencial_base64

# Google Gemini AI (opcional)
GEMINI_API_KEY=tu_gemini_api_key

# Servidor
PORT=3000
BASE_URL=https://tu-dominio.com
```

### 4. Configurar Google Sheets
1. Crear una hoja de cálculo en Google Sheets
2. Crear las siguientes hojas:
   - `Citas Bienestar Universitario` - Para almacenar citas psicológicas
   - `Base de Datos` - Para información de estudiantes (opcional)

### 5. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📱 Uso del Bot

### Flujo de Psicología
1. El usuario escribe "Hola"
2. Selecciona "Psicología 🧠"
3. Elige "Agendar cita de orientación psicológica"
4. Proporciona: nombre, código estudiantil, edad, carrera
5. Confirma los datos
6. La cita se guarda en Google Sheets

### Flujo de Comedor
1. El usuario escribe "Hola"
2. Selecciona "Comedor Universitario 🍽️"
3. Elige la opción deseada (menú, horarios, precios, etc.)
4. Recibe la información solicitada

## 🔧 Estructura del Proyecto

```
src/
├── app.js                 # Configuración principal de Express
├── config/
│   └── env.js            # Configuración de variables de entorno
├── controllers/
│   └── webhookController.js  # Controlador de webhooks de WhatsApp
├── routes/
│   └── webhookRoutes.js      # Rutas de webhook
├── services/
│   ├── messageHandler.js     # Lógica principal del bot
│   ├── whatsappService.js    # Servicio de WhatsApp
│   ├── googleSheestsService.js # Servicio de Google Sheets
│   ├── geminiService.js      # Servicio de IA (opcional)
│   └── httpRequest/
│       └── sendToWhatsApp.js # Cliente HTTP para WhatsApp
└── credentials/           # Credenciales de Google (opcional)
```

## 📊 Almacenamiento de Datos

Los datos se almacenan en Google Sheets con la siguiente estructura:

### Hoja: Citas Bienestar Universitario
- Teléfono
- Nombre completo
- Código estudiantil
- Edad
- Carrera
- Tipo de servicio
- Fecha de registro
- Estado

## 🔄 Tareas Programadas

El bot incluye tareas programadas para:
- Verificar y enviar recordatorios de citas psicológicas
- Mantener la sincronización con Google Sheets

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Para soporte técnico o consultas sobre el bot:

- **Email**: bienestar@univalle.edu.co
- **Teléfono**: (032) 3212100 ext. 1234
- **Ubicación**: Edificio de Bienestar Universitario - Universidad del Valle

## 📄 Licencia

Este proyecto es propiedad de la Universidad del Valle - Área de Bienestar Universitario.

---

**Desarrollado con ❤️ para la comunidad estudiantil de la Universidad del Valle** 