import { google } from "googleapis";
import config from '../config/env.js';

const sheets = google.sheets("v4");

// Función para obtener las credenciales desde la variable de entorno
function getCredentials() {
  if (!config.GOOGLE_CREDENTIALS_BASE64) {
    console.error('❌ Error: La variable de entorno GOOGLE_CREDENTIALS_BASE64 no está definida.');
    throw new Error('Credenciales de Google no configuradas en el entorno.');
  }
  try {
    const credentialsJson = Buffer.from(config.GOOGLE_CREDENTIALS_BASE64, 'base64').toString();
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('❌ Error al decodificar o parsear las credenciales base64:', error);
    throw new Error('Error al procesar credenciales de Google desde base64');
  }
}

// Función genérica para agregar a cualquier hoja
async function addRowToSheet(auth, spreadsheetId, values, sheetName) {
  const request = {
    spreadsheetId,
    range: sheetName,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [values],
    },
    auth,
  };
  try {
    console.log('📊 Intentando agregar fila a la hoja:', sheetName);
    const response = await sheets.spreadsheets.values.append(request);
    console.log('✅ Fila agregada correctamente a:', sheetName);
    return response;
  } catch (error) {
    console.error(`❌ Error al agregar fila a ${sheetName}:`, error.response?.data || error.message);
    throw error;
  }
}

// Obtener cliente de autenticación UNA SOLA VEZ
async function getAuthClient() {
  try {
    const credentials = getCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const client = await auth.getClient();
    console.log('👤 Cliente Google Sheets autenticado correctamente.');
    return client;
  } catch (error) {
    console.error('❌ Error fatal al autenticar con Google Sheets:', error);
    throw error; // Detener si la autenticación falla
  }
}

let authClient = null; // Variable para almacenar el cliente autenticado

// Inicializar el cliente al arrancar (opcional pero recomendado)
getAuthClient().then(client => { authClient = client; }).catch(() => { /* Manejar error de inicialización si es necesario */ });

// 👉 Para reservas (hoja principal)
const appendToSheet = async (data) => {
  if (!authClient) {
    console.log('🔄 Reintentando autenticación de Google Sheets...');
    try {
      authClient = await getAuthClient();
    } catch (error) {
      console.error('❌ Falló la re-autenticación.');
      throw new Error('No se pudo autenticar con Google Sheets.');
    }
  }
  try {
    console.log('📝 Iniciando guardado en hoja Reservas GymBro...');
    const spreadsheetId = "1sNHbR0y52mlRE3z5E8JTaOMktUro3fPm6ZZPxXIUVZY";
    await addRowToSheet(authClient, spreadsheetId, data, "Reservas GymBro");
    console.log('✅ Datos de reserva guardados exitosamente.');
    return "Datos correctamente agregados a la hoja de reservas.";
  } catch (error) {
    console.error('❌ Error al guardar en hoja Reservas GymBro:', error);
    throw error; // Propagar para que messageHandler lo capture
  }
};

// 🆕 Para pausas de membresía (segunda hoja)
const appendPauseToSheet = async (data) => {
    if (!authClient) {
        console.log('🔄 Reintentando autenticación de Google Sheets...');
        try {
            authClient = await getAuthClient();
        } catch (error) {
            console.error('❌ Falló la re-autenticación.');
            throw new Error('No se pudo autenticar con Google Sheets.');
        }
    }
    try {
        console.log('📝 Iniciando guardado en hoja pausas_mensualidad...');
        const spreadsheetId = "1sNHbR0y52mlRE3z5E8JTaOMktUro3fPm6ZZPxXIUVZY";
        await addRowToSheet(authClient, spreadsheetId, data, "pausas_mensualidad");
        console.log('✅ Datos de pausa guardados exitosamente.');
        return "Pausa registrada correctamente.";
    } catch (error) {
        console.error('❌ Error al guardar en hoja pausas_mensualidad:', error);
        throw error;
    }
};

// 🔍 Consultar estado de membresía
async function consultarMembresia(cedula) {
    console.log(`[consultarMembresia] Iniciando consulta para cédula: ${cedula}`); // Log inicio
    if (!authClient) {
        console.log('[consultarMembresia] 🔄 Reintentando autenticación de Google Sheets...');
        try {
            authClient = await getAuthClient();
        } catch (error) {
            console.error('[consultarMembresia] ❌ Falló la re-autenticación.');
            // Devolver un objeto de error consistente
            return { encontrado: false, mensaje: "Error interno al conectar con Google Sheets." };
        }
    }
    try {
        const spreadsheetId = "1sNHbR0y52mlRE3z5E8JTaOMktUro3fPm6ZZPxXIUVZY";
        console.log(`[consultarMembresia] 🔍 Consultando Spreadsheet ID: ${spreadsheetId}, Range: Base de Datos`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Base de Datos", // Asegúrate que este nombre sea EXACTO al de tu hoja
            auth: authClient,
        });
        console.log('[consultarMembresia] ✅ Consulta a API de Google Sheets exitosa.');
        const rows = response.data.values || [];
        console.log(`[consultarMembresia] ${rows.length} filas obtenidas de 'Base de Datos'.`);

        // Filtrar filas de forma segura
        const userRows = rows.filter(row => row && typeof row[1] === 'string' && row[1].trim() === cedula.trim());
        console.log(`[consultarMembresia] ${userRows.length} filas encontradas para la cédula ${cedula}.`);

        if (userRows.length === 0) {
            console.log(`[consultarMembresia] ❌ Cédula ${cedula} no encontrada.`);
            return { encontrado: false, mensaje: "❌ No se encontró ninguna membresía asociada a esta cédula." };
        }

        const lastRow = userRows[userRows.length - 1];
        console.log(`[consultarMembresia] Última fila encontrada:`, lastRow);
        // Asegurarse de que los índices son correctos para tu hoja 'Base de Datos'
        // [telefono, cedula, nombre, tiempo, fechaInicio, fechaFin, estado]
        const [telefono, cedulaUser, nombre, tiempoPago, fechaInicio, fechaFin, estado] = lastRow;

        console.log(`[consultarMembresia] Procesando datos: Nombre=${nombre}, Estado=${estado}, FechaFin=${fechaFin}`);

        const hoy = new Date();
        // Validar fechaFin antes de crear el objeto Date
        let finMembresia;
        try {
            finMembresia = new Date(fechaFin);
            if (isNaN(finMembresia.getTime())) {
                throw new Error('Fecha de fin inválida');
            }
        } catch (dateError) {
            console.error(`[consultarMembresia] ⚠️ Error al parsear fechaFin '${fechaFin}':`, dateError);
            return { encontrado: true, mensaje: `⚠️ Se encontró tu registro (${nombre}), pero hay un problema con la fecha de finalización (${fechaFin}). Contacta a un asesor.` };
        }

        const diferenciaDias = Math.ceil((finMembresia - hoy) / (1000 * 60 * 60 * 24));
        let estadoActual = estado ? estado.toLowerCase().trim() : 'desconocido';
        if (diferenciaDias <= 0 && estadoActual === 'activo') {
            estadoActual = 'vencido';
        }
        console.log(`[consultarMembresia] Estado calculado: ${estadoActual}, Días restantes: ${diferenciaDias}`);

        let mensaje = `👤 *Membresía de ${nombre}*\n\n`;
        if (estadoActual === 'activo') {
            mensaje += `✅ Estado: Activo\n📅 Fecha inicio: ${fechaInicio}\n📅 Fecha fin: ${fechaFin}\n⏳ Días restantes: ${diferenciaDias}\n💰 Plan: ${tiempoPago}`;
        } else if (estadoActual === 'vencido') {
            mensaje += `❌ Estado: Vencido\n📅 Última membresía finalizó: ${fechaFin}\n💭 ¡Renueva tu membresía para seguir entrenando!`;
        } else {
            mensaje += `⚠️ Estado: ${estado || 'No definido'}\n📅 Última actualización: ${fechaFin || 'N/A'}`;
        }

        console.log(`[consultarMembresia] Mensaje final construido.`);
        return {
            encontrado: true,
            mensaje,
            datos: { nombre, estado: estadoActual, diasRestantes: diferenciaDias, fechaFin, tiempoPago }
        };

    } catch (error) {
        console.error(`[consultarMembresia] ❌ Error durante la consulta para ${cedula}:`, error.response?.data || error.message, error.stack);
        return { encontrado: false, mensaje: "❌ Ocurrió un error al consultar la base de datos de membresías. Intenta más tarde." };
    }
}

// 🆕 Función para obtener todas las membresías activas
async function getAllActiveMemberships() {
    console.log("[getAllActiveMemberships] Iniciando obtención de todas las membresías activas.");
    if (!authClient) {
        console.log('[getAllActiveMemberships] 🔄 Reintentando autenticación de Google Sheets...');
        try {
            authClient = await getAuthClient();
        } catch (error) {
            console.error('[getAllActiveMemberships] ❌ Falló la re-autenticación.');
            throw new Error('Error interno al conectar con Google Sheets al obtener membresías.');
        }
    }
    try {
        const spreadsheetId = "1sNHbR0y52mlRE3z5E8JTaOMktUro3fPm6ZZPxXIUVZY";
        console.log(`[getAllActiveMemberships] 🔍 Consultando Spreadsheet ID: ${spreadsheetId}, Range: Base de Datos`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Base de Datos!A:G", // Leer columnas A hasta G
            auth: authClient,
        });
        console.log('[getAllActiveMemberships] ✅ Consulta a API de Google Sheets exitosa.');
        const rows = response.data.values || [];
        console.log(`[getAllActiveMemberships] ${rows.length} filas obtenidas de 'Base de Datos'.`);

        if (rows.length <= 1) { // Considerar que la primera fila puede ser de encabezados
            console.log("[getAllActiveMemberships] No hay suficientes datos en la hoja.");
            return [];
        }

        // Asumir que la primera fila es de encabezados y la omitimos.
        // Columnas esperadas: Telefono, Cedula, Nombre, TiempoPago, FechaInicio, FechaFin, Estado
        const activeMemberships = [];
        const header = rows[0].map(h => String(h).trim().toLowerCase());
        const phoneIndex = header.indexOf("telefono");
        const nameIndex = header.indexOf("nombre");
        const endDateIndex = header.indexOf("fechafin"); // Asegurarse que el encabezado es 'fechafin'
        const statusIndex = header.indexOf("estado");

        if (phoneIndex === -1 || nameIndex === -1 || endDateIndex === -1 || statusIndex === -1) {
            console.error("[getAllActiveMemberships] ❌ No se encontraron todos los encabezados necesarios (telefono, nombre, fechafin, estado) en 'Base de Datos'. Verifica los nombres de las columnas.");
            // Intentar usar índices fijos como fallback o lanzar error
            // Por ahora, lanzaremos un error para forzar la corrección de encabezados.
            throw new Error("Encabezados faltantes o incorrectos en la hoja 'Base de Datos'.");
        }
        
        // Iterar desde la segunda fila (índice 1)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // Asegurarse que la fila y las celdas necesarias existen
            if (!row || !row[statusIndex] || !row[endDateIndex] || !row[phoneIndex] || !row[nameIndex]) {
                console.warn(`[getAllActiveMemberships] Fila ${i+1} incompleta, saltando.`);
                continue;
            }

            const estado = String(row[statusIndex]).toLowerCase().trim();
            const fechaFinStr = row[endDateIndex];
            const telefono = String(row[phoneIndex]).trim();
            const nombre = String(row[nameIndex]).trim();

            if (estado === 'activo') {
                try {
                    const fechaFin = new Date(fechaFinStr);
                    if (isNaN(fechaFin.getTime())) {
                        console.warn(`[getAllActiveMemberships] Fecha de fin inválida ('${fechaFinStr}') para ${nombre} (tel: ${telefono}) en fila ${i+1}. Saltando.`);
                        continue;
                    }
                    activeMemberships.push({
                        telefono,
                        nombre,
                        fechaFin,
                        estado
                    });
                } catch (dateError) {
                    console.warn(`[getAllActiveMemberships] Error parseando fechaFin '${fechaFinStr}' para ${nombre} (tel: ${telefono}) en fila ${i+1}:`, dateError);
                }
            }
        }
        console.log(`[getAllActiveMemberships] ${activeMemberships.length} membresías activas encontradas.`);
        return activeMemberships;

    } catch (error) {
        console.error(`[getAllActiveMemberships] ❌ Error durante la obtención de membresías activas:`, error.response?.data || error.message, error.stack);
        throw error; // Propagar el error para manejo superior
    }
}

// Leer citas (opcional, si no se usa se puede quitar)
async function getAppointments() {
    if (!authClient) {
        console.log('🔄 Reintentando autenticación de Google Sheets...');
        try {
            authClient = await getAuthClient();
        } catch (error) {
            console.error('❌ Falló la re-autenticación.');
            return []; // Devuelve vacío si falla la autenticación
        }
    }
    try {
        console.log('📊 Leyendo citas desde Reservas GymBro...');
        const spreadsheetId = "1sNHbR0y52mlRE3z5E8JTaOMktUro3fPm6ZZPxXIUVZY";
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Reservas GymBro",
            auth: authClient,
        });
        const rows = response.data.values || [];
        console.log(`✅ ${rows.length} citas leídas.`);
        // Asegurarse de que el mapeo coincida con las columnas
        return rows.map((row) => ({
          telefono: row[0],
          name: row[1], 
          age: row[2],
          day: row[3],
          reason: row[4],
          hour: row[5],
          createdAt: row[6]
        }));
    } catch (error) {
        console.error("❌ Error al leer citas desde Sheets:", error);
        return [];
    }
}

export { appendToSheet, appendPauseToSheet, getAppointments, consultarMembresia, getAllActiveMemberships };
