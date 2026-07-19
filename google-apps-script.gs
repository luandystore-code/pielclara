/**
 * PIELCLARA — RECEPTOR DE PEDIDOS
 * Guarda cada pedido del formulario en Google Sheets y avisa por WhatsApp al instante.
 *
 * INSTALACIÓN (una sola vez):
 * 1. Abre el Google Sheet con ID 1hHHK0CdsrIm2bZnWsXadlTO2uKF8OFBgyUkJeeg8Qeg
 *    y confirma que exista una pestaña llamada exactamente "Pedidos".
 * 2. Menú Extensiones -> Apps Script (puede ser desde esa hoja o un proyecto standalone,
 *    ya no importa porque este script abre la hoja explícitamente por su ID).
 * 3. Borra todo el contenido del editor y pega este archivo completo.
 * 4. Guarda (Ctrl+S). Ponle nombre al proyecto, ej. "PielClara Pedidos".
 * 5. Implementar -> Nueva implementación:
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario (OBLIGATORIO)
 * 6. Autoriza los permisos que te pida Google la primera vez.
 * 7. Copia la URL que termina en /exec y pégala en ORDER_ENDPOINT dentro del <script> de la landing.
 *
 * Si vuelves a editar este código, siempre debes ir a
 * Implementar -> Gestionar implementaciones -> lápiz ✏️ -> Versión: Nueva -> Implementar,
 * o la URL seguirá corriendo la versión vieja.
 */

const CALLMEBOT_PHONE = "51949222654";
const CALLMEBOT_APIKEY = "9223041";
const SHEET_ID = "1hHHK0CdsrIm2bZnWsXadlTO2uKF8OFBgyUkJeeg8Qeg";
const SHEET_NAME = "Pedidos";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // espera hasta 10s si hay otro pedido guardándose al mismo tiempo

  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('No se encontró la pestaña "' + SHEET_NAME + '" en el Sheet. Revisa el nombre exacto.');
    }

    // Si la hoja está vacía, crea los encabezados una sola vez, en el orden pedido.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Número de pedido', 'Nombre del producto', 'Cantidad del producto', 'Precio total',
        '* Nombre y apellido', 'Dirección', 'Referencia', 'Número de teléfono',
        'Distrito', 'Provincia', '* Fecha de creación',
        'UTM medium', 'UTM content', 'UTM term', 'Pagina'
      ]);
    }

    const orderNumber = Math.max(sheet.getLastRow(), 1);
    const fechaCreacion = Utilities.formatDate(new Date(), "America/Lima", "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      orderNumber,
      data.producto     || '',
      data.unidades      || '',
      data.total          || '',
      data.nombre        || '',
      data.direccion     || '',
      data.referencia    || '',
      data.telefono      || '',
      data.distrito      || '',
      data.provincia     || '',
      fechaCreacion,
      data.utm_medium    || '',
      data.utm_content   || '',
      data.utm_term      || '',
      data.pagina        || ''
    ]);

    data.orderNumber = orderNumber;
    data.fechaHora = fechaCreacion;

    notificarWhatsApp(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", orderNumber: orderNumber }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function notificarWhatsApp(data) {
  const mensaje =
    "🛍️ Nuevo pedido PielClara #" + data.orderNumber + "\n" +
    "Fecha y hora: " + data.fechaHora + "\n" +
    "Producto: " + data.producto + "\n" +
    "Nombre: " + data.nombre + "\n" +
    "Teléfono: " + data.telefono + "\n" +
    "Distrito: " + data.distrito + " - " + (data.provincia || '') + "\n" +
    "Dirección: " + data.direccion + (data.referencia ? " (Ref: " + data.referencia + ")" : "") + "\n" +
    "Unidades: " + data.unidades + "\n" +
    "Total a cobrar (Pago Contraentrega): S/" + data.total + "\n" +
    "Origen: " + (data.utm_medium || "directo") + " / " + (data.utm_content || "-");

  const url = "https://api.callmebot.com/whatsapp.php"
    + "?phone=" + encodeURIComponent(CALLMEBOT_PHONE)
    + "&text=" + encodeURIComponent(mensaje)
    + "&apikey=" + encodeURIComponent(CALLMEBOT_APIKEY);

  UrlFetchApp.fetch(url, { muteHttpExceptions: true });
}

function doGet(e) {
  return ContentService.createTextOutput("¡Hola! El endpoint de pedidos PielClara está conectado y funcionando ✅");
}
