# Arquitectura

**Aplicación de escritorio Electron**, interfaz HTML/CSS local, proceso principal Node.js y preload con IPC limitado. Instalador NSIS por usuario para Windows x64; DMG para macOS Intel/Apple Silicon, compilado en macOS. La portada original es un recurso local: no se descarga HTML remoto.

## Flujo

1. Detectar carpeta Minecraft o pedirla mediante selector nativo.
2. Comprobar que Minecraft y su launcher están cerrados.
3. Localizar Java 21 o descargar una distribución Temurin fijada por URL, tamaño y SHA-256, extraída dentro de los datos de PepaWorld.
4. Descargar el instalador oficial NeoForge 21.1.250 y validar su SHA-256 fijado al compilar.
5. Preparar Minecraft 1.21.1 con metadatos/client JAR oficiales, comprobando SHA-1 del catálogo oficial. Ejecutar `java -jar ... --installClient <carpeta-temporal>` con Java 21, sin interfaz manual.
6. Copiar bibliotecas/versiones a la carpeta Minecraft seleccionada. Si existe un archivo distinto no lo sobrescribe; pide revisar el conflicto.
7. Aplicar el manifest de mods a la instancia independiente, con descarga previa completa, validación, journal y rollback.
8. Fusionar `servers.dat` NBT y registrar el perfil `pepaworld-3`, conservando datos no relacionados.
9. Abrir el launcher elegido. El oficial decide cuenta y sesión y arranca el juego cuando el jugador pulsa su botón.

El instalador NeoForge prepara las bibliotecas/transformaciones; el launcher oficial resuelve los assets y descargas normales restantes en el primer arranque. No se redistribuyen binarios de Minecraft dentro de esta entrega.

## Actualizaciones

`manifest.json` contiene ID de pack, versión visible, revisión monotónica, Minecraft/NeoForge fijados y lista de rutas, tamaños, SHA-256 y política. `objects/<SHA-256>` contiene los bytes inmutables. Publicar objetos antes del manifest.

El proceso es exclusivo dentro de la aplicación; se permite una sola instancia del launcher. El cierre normal se bloquea durante instalación. Si hay interrupción abrupta, el journal se recupera al siguiente inicio. Una transacción descargada no marca la instalación como lista hasta generar también el perfil y la lista de servidores.

## Límites deliberados

- No consulta, guarda ni renueva tokens Microsoft/Xbox/Minecraft.
- No tiene modo de autenticación propia ni arranque offline inventado.
- No modifica los servidores ni las normas del juego.
- No puede garantizar integraciones con todos los launchers sin adaptadores específicos.
- No incluye un alojamiento contratado ni una URL ficticia de actualizaciones.
- No actualiza silenciosamente el binario del launcher ni Minecraft/NeoForge mediante el manifest.
- Requiere prueba de juego real y firma de distribución para un lanzamiento general sin avisos del sistema.

## Protección de archivos

Rutas relativas comprobadas, sin `..`, ADS de Windows, nombres reservados, enlaces/junctions ni carpetas ajenas al pack. Validación de hashes y tamaños, descarga temporal, copias antes de reemplazar, recuperación probada. La UI tiene sandbox, contextIsolation, Node deshabilitado, CSP local, bloqueo de ventanas/navegación y validación de emisor IPC.

Los JAR, scripts KubeJS y actualizaciones se ejecutan con los permisos del juego; el canal HTTPS debe pertenecer al administrador y permanecer protegido. Los archivos fuente de mods conservan sus licencias. El código del launcher no concede derechos adicionales sobre Minecraft, los mods o la portada.
