# Cómo actualizar el modpack

El canal de este proyecto ya está configurado en `https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/version.json`. Para GitHub, publica los contenidos de `release/objects/` en `objects/` y el contenido completo de `release/manifest.json` como `version.json`. Mantén `manifest.json` dentro de `release/` para el paquete incluido. La siguiente revisión después de 3.0.1 / 2 debe usar un número mayor que 2.

## Primera publicación

1. Ejecuta `npm run prepare:bundle` una vez si acabas de extraer el ZIP del proyecto. Después, utiliza un alojamiento de archivos con HTTPS y descargas directas. Puede ser tu propio servidor web o almacenamiento de objetos. La IP de Minecraft no proporciona automáticamente alojamiento web.
2. Sube **el contenido** de `release/` a una carpeta, por ejemplo `pepaworld/`. Deben quedar `pepaworld/manifest.json` y `pepaworld/objects/<hash>`. El ejemplo no es una URL publicada.
3. Abre tu URL real de `manifest.json` en un navegador. Debe devolver JSON, sin login ni página HTML intermedia. Los objetos deben descargarse como archivos, conservando sus bytes. No necesitas CORS: las descargas las hace el proceso nativo del launcher.
4. Pon esa URL en `manifestUrl` de `launcher.config.json` y compila el instalador. Así los jugadores la reciben preconfigurada.

Sirve `manifest.json` con `Cache-Control: no-cache` y `objects/*` con `Cache-Control: public, max-age=31536000, immutable`. El alojamiento debe permitir nombres hexadecimales sin extensión y respuestas binarias. No subas cuentas, logs, mundos, backups, el código del launcher ni `pack/excluded` al canal de actualizaciones.

## Cuando cambies mods o configuraciones

1. Haz una copia de tu proyecto y conserva el manifest publicado anterior.
2. Edita **solo `pack/client/`**. Sustituye el JAR antiguo por el nuevo: no dejes dos versiones. Revisa sus dependencias y mantén la misma versión que necesite el servidor.
3. Prueba primero con tu cliente y el servidor. Revisa especialmente la ruleta Fabric + Connector. Solo quita sus avisos de `pack/review.json` cuando tengas la prueba correspondiente.
4. Abre una terminal en el proyecto y ejecuta:

   ```sh
   node tools/release.cjs 3.0.1 2
   ```

   `3.0.1` es el nombre que se muestra; `2` es la revisión numérica. Cada publicación debe usar un número mayor: 3, 4, 5… No reutilices una revisión para cambiar bytes.
5. Sube primero los archivos nuevos de `release/objects/`. Los nombres son el SHA-256: no cambian si el contenido no ha cambiado. No borres objetos antiguos mientras haya clientes que puedan necesitarlos.
6. Sube **`manifest.json` al final**, preferiblemente mediante reemplazo atómico. Si lo publicas antes, los clientes podrían encontrar archivos aún no disponibles.
7. Abre el launcher: comprueba que ve la nueva versión, pulsa Actualizar y entra al servidor.

No hace falta recompilar el instalador para actualizaciones de mods/configs una vez configurada la URL. Sí conviene recompilar periódicamente para que los nuevos jugadores reciban el paquete inicial actualizado y para actualizar Electron.

## Qué hace el actualizador

- Compara el SHA-256 real de cada archivo, no solo la versión guardada.
- Usa el archivo incluido cuando coincide; descarga únicamente los cambios que faltan.
- Comprueba tamaño y SHA-256 antes de aplicar nada; reintenta descargas fallidas.
- Guarda copia de los archivos que reemplaza o retira.
- Retira únicamente archivos administrados que estaban en el manifest anterior y ya no están en el nuevo.
- Conserva `options.txt`, mundos, capturas, mapas del jugador y archivos ajenos al manifest.
- Si falla la aplicación, restaura la versión anterior; si se cierra de forma abrupta, recupera la transacción al abrirse otra vez.
- No permite retroceder automáticamente a una revisión menor.

Las configuraciones del pack usan `managed`: pueden reemplazarse al actualizar. Existe la política `seed` para archivos de preferencias que solo deban copiarse si no existen, pero el generador utiliza `managed` por defecto. Un cambio de política debe revisarse antes de publicar.

La integridad depende de HTTPS y de los hashes del manifest. El manifest no lleva firma criptográfica independiente: protege la cuenta y el alojamiento, porque controlar ese canal permite distribuir JAR y scripts del juego. No hay tokens del alojamiento dentro del launcher.

## Si algo falla

Cierra Minecraft y el launcher oficial, vuelve a pulsar Actualizar. Si falla NeoForge, consulta `neoforge-install.log` en la carpeta de datos de PepaWorld (un nivel por encima de `instance`). Si falla un mod, revisa `instance/logs/latest.log` y `instance/crash-reports`.

Las copias están en `backups/<fecha-id>/`. No las borres durante una actualización. El manifest instalado está en `installed.json`; `transaction.json` solo existe mientras se aplica una actualización. No lo elimines para saltarte una recuperación.

La actualización automática solo afecta al **modpack**. Para actualizar el ejecutable del launcher, compila y distribuye otro instalador; no se ha añadido un autoactualizador del propio programa.
