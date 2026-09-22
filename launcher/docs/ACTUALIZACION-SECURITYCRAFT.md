# SecurityCraft 1.10.2.1 y canal online

Este proyecto incorpora el JAR elegido por Puerto: `[1.21.1] SecurityCraft v1.10.2.1.jar`, de 5.193.371 bytes y SHA-256 `75ac9e73c60caf58df7069f167dbacc00a640e1418207dff654f56a5fdb5f229`.

Sustituye al archivo antiguo `[26.2] SecurityCraft v1.10.2.1.jar`, cuyo interior declaraba versión 1.10.2. La auditoría original se conserva como referencia del paquete anterior.

El modpack pasa a 3.0.1, revisión 2; el launcher a 0.1.2. La URL predeterminada es:

https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/version.json

Al abrir esta versión del launcher, los ajustes antiguos sin URL reciben el canal oficial una sola vez. Se conservan las rutas, memoria y demás preferencias, así como los canales personalizados. Después de esa migración se respeta que el jugador cambie o vacíe la URL.

El ejecutable anterior puede usar el mismo canal introduciendo esa dirección en Ajustes → URL de actualizaciones y pulsando Actualizar. La publicación online no modifica por sí sola los ajustes ni el ejecutable antiguo.

Para publicar revisiones futuras, generar `release/manifest.json` con `tools/release.cjs`, subir primero `release/objects/` a `objects/` y copiar el manifest completo a `version.json` en PepaWorld-Updates. Mantener el nombre `manifest.json` dentro de `release/`, porque el launcher lo usa para el paquete incluido.

El JAR nuevo declara Minecraft [1.21.1,1.22) y NeoForge >=21.1.206, compatibles con la configuración 1.21.1 / 21.1.250. La prueba del arranque gráfico y de conexión al servidor queda pendiente; se mantienen los avisos originales del pack.
