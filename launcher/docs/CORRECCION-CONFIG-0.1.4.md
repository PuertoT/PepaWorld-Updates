# Launcher 0.1.4: configuraciones guardadas por los mods

El caso observado afecta a `config/sereneseasons/fertility.toml` y `config/sereneseasons/seasons.toml`. Tras jugar, sus bytes solo difieren del paquete en los saltos de línea CRLF frente a LF; sus valores no han cambiado.

La revisión 4 del modpack (3.0.2) conserva los mismos 50 archivos y los mismos objetos de descarga. Añade `textSha256` a las configuraciones TOML bajo `config/`. El generador calcula esta huella eliminando únicamente el byte CR cuando va seguido de LF, sin decodificar ni alterar los demás bytes.

El launcher 0.1.4 acepta una configuración existente si coincide su hash exacto o esa huella de saltos de línea normalizados. No reescribe configuraciones equivalentes. Sigue detectando cualquier otra diferencia, conserva la integridad estricta de los JAR y verifica tamaño y SHA-256 exactos de todas las descargas. La política continúa siendo `managed`.

El aviso de reparación identifica los archivos modificados o ausentes (hasta seis rutas y el número de archivos adicionales). Una revisión numérica nueva permite migrar desde la revisión 3 sin reutilizar un inventario distinto con el mismo número.

Para aplicar la corrección, instalar 0.1.4 con PepaWorld cerrado y pulsar Actualizar una vez con Minecraft y su launcher cerrados. Los clientes anteriores ignoran la huella adicional; necesitan este instalador para dejar de mostrar el falso aviso.

Validación: 30 pruebas correctas y una omitida en Windows. La inspección de la instalación real, sin modificarla, muestra cero archivos pendientes con el manifest corregido. Las pruebas cubren cambios de valores, archivos ausentes, migración de revisiones, preservación de CRLF y rechazo de huellas de texto en mods.
