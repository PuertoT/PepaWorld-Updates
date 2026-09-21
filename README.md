# PepaWorld-Updates

Canal público de actualizaciones del modpack PepaWorld 3.0.

URL maestra del launcher:

https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/version.json

La versión 3.0.1 (revisión 2) incluye SecurityCraft 1.10.2.1 para Minecraft 1.21.1 y NeoForge 21.1.250. El JAR es el archivo elegido por Puerto, con SHA-256 `75ac9e73c60caf58df7069f167dbacc00a640e1418207dff654f56a5fdb5f229` y 5.193.371 bytes.

## Publicar una actualización

`version.json` contiene el inventario completo del cliente, no solo los archivos modificados. Cada registro declara `path`, `size`, `sha256` y `policy`. Los contenidos se sirven en `objects/<sha256>`, sin extensión ni transformación. Un objeto puede corresponder a varias rutas si comparten contenido.

1. Sustituir los archivos en `pack/client/` del proyecto fuente del launcher y probar el cliente con el servidor.
2. Generar una revisión superior con `node tools/release.cjs VERSION REVISION`.
3. Subir los nuevos contenidos de `release/objects/` a `objects/`. Mantener los objetos antiguos.
4. Publicar al final el contenido de `release/manifest.json` como `version.json` en este repositorio.

El launcher verifica los hashes y descarga solo los archivos que faltan o han cambiado. Retira los archivos administrados de la revisión anterior que desaparecen del inventario; conserva archivos ajenos y los de política `seed`. No deben publicarse manifests parciales.

Los avisos de compatibilidad incluidos en el manifest se conservan hasta completar las pruebas del cliente y del servidor. Este canal actualiza el modpack, no el ejecutable del launcher.
