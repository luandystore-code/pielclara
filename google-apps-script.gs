/**
 * PielClara — Recibe pedidos del formulario de la landing y los guarda en Google Sheets.
 *
 * INSTALACIÓN (una sola vez):
 * 1. Crea (o abre) tu Google Sheet donde quieres que caigan los pedidos.
 * 2. Menú Extensiones -> Apps Script.
 * 3. Borra todo el contenido del editor y pega este archivo completo.
 * 4. Guarda (icono de disco o Ctrl+S). Ponle un nombre al proyecto, ej. "PielClara Pedidos".
 * 5. Click en "Implementar" (Deploy) -> "Nueva implementación" (New deployment).
 *    - Tipo: "Aplicación web" (Web app)
 *    - Descripción: lo que quieras
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) — OBLIGATORIO, si no la landing no podrá escribir
 * 6. Click "Implementar". Google te pedirá autorizar permisos la primera vez (acepta).
 * 7. Copia la URL que te da (termina en /exec). Esa es tu ORDER_ENDPOINT.
 * 8. Pégala en el <script> de tu landing, en la constante ORDER_ENDPOINT.
 *
 * Si luego editas este script, cada vez que hagas cambios debes volver a
 * "Implementar" -> "Gestionar implementaciones" -> ícono de lápiz -> Versión "Nueva" -> Implementar,
 * o la URL seguirá corriendo la versión vieja del código.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Si la hoja está vacía, crea los encabezados una sola vez.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Fecha registro', 'Producto', 'Nombre', 'Teléfono', 'Distrito', 'Provincia',
        'Dirección', 'Referencia', 'Kit', 'Unidades', 'Total (S/)',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'Página', 'Fecha del pedido'
      ]);
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.producto || '',
      data.nombre || '',
      data.telefono || '',
      data.distrito || '',
      data.provincia || '',
      data.direccion || '',
      data.referencia || '',
      data.kit || '',
      data.unidades || '',
      data.total || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.utm_term || '',
      data.utm_content || '',
      data.pagina || '',
      data.fecha || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Opcional: para probar que el deploy funciona abriendo la URL /exec en el navegador.
function doGet(e) {
  return ContentService
    .createTextOutput('El endpoint de pedidos PielClara está activo ✅')
    .setMimeType(ContentService.MimeType.TEXT);
}
