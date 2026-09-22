# Actualización remota del launcher

Disponible desde 0.2.0 para Windows x64. La primera instalación de 0.2.0 es manual; las versiones anteriores no tienen esta función.

Al abrir PepaWorld o pulsar Comprobar se consultan dos canales independientes:

- Modpack: https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/version.json
- Launcher: https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/launcher.json

Si existe un launcher posterior, aparece Actualizar launcher. Con Minecraft y su launcher cerrados, el botón descarga el instalador desde GitHub Releases y comprueba tamaño y SHA-256. Después permite elegir Instalar ahora o Más tarde. Instalar ahora vuelve a verificar el archivo, abre el asistente y cierra PepaWorld; se completan los pasos del asistente para instalar la nueva versión. No se modifica la instancia del juego ni se borran ajustes. No es una instalación silenciosa.

El instalador continúa sin firma digital. El control de integridad usa HTTPS y la huella publicada en el repositorio oficial. Nunca se incluyen credenciales de GitHub en el programa. La descarga de ejecutables se limita a la ruta de Releases de PuertoT/PepaWorld-Updates, con versión y nombre exactos. No se permiten bajadas de versión ni reinstalaciones de la misma versión desde ese botón. Una comprobación fallida del launcher no bloquea Jugar.

## Publicar la siguiente versión

1. Modificar los archivos bajo `launcher/` en PepaWorld-Updates.
2. Aumentar la versión estable numérica en `launcher/package.json` y en las dos entradas de versión raíz de `launcher/package-lock.json` (por ejemplo, 0.2.0 → 0.2.1). No reutilizar versiones publicadas.
3. Publicar los cambios en main. El workflow Publicar launcher Windows instala las dependencias fijadas, ejecuta las pruebas y reconstruye el modpack desde el inventario y los objetos de ese commit.
4. El workflow compila el EXE, crea una Release primero en borrador y sube el instalador y su launcher.json. Solo después de verificar los tamaños y hashes de los archivos subidos hace pública la Release y actualiza el canal launcher.json en main.
5. Si una ejecución falla después de hacer pública la Release, al repetirla recupera su manifest verificado y termina la actualización del canal sin reemplazar el ejecutable publicado. Si existe una versión superior en el canal, no lo rebaja.

El workflow solo se activa al modificar package.json, el propio workflow o desde Run workflow. No publica automáticamente al cambiar un mod. Su permiso contents:write se utiliza para las Releases y el manifest del launcher; GH_TOKEN está disponible únicamente en el paso de publicación.

Los archivos de `pack/client/` y `release/objects/` no se duplican bajo launcher/ en GitHub. `node tools/restore-bundle.cjs ..` los reconstruye desde los objetos del repositorio para compilar. El ZIP local completo conserva pack/client para compilar sin clonar esos objetos por separado.
