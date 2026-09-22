# PepaWorld 3.0 — Instalador y launcher

Minecraft Java **1.21.1**, NeoForge **21.1.250**, servidor **45.43.163.21:25570**.

Esta entrega contiene el proyecto del launcher **0.2.0** y el modpack **3.0.2, revisión 4**, con el JAR de SecurityCraft 1.10.2.1 elegido por Puerto. Incluye el canal online configurado y la migración de ajustes antiguos sin URL. Lee `docs/ACTUALIZACION-SECURITYCRAFT.md`. Se conservan los avisos del paquete de prueba: la ruleta requiere una prueba real con Connector y todavía no se ha comprobado una sesión gráfica conectada al servidor.

## Para probarlo en Windows

1. Compila el instalador Windows con `COMPILAR-WINDOWS.bat`, ejecuta el EXE generado en `dist/` y abre el acceso directo **PepaWorld 3.0**.
2. Cierra Minecraft y su launcher. Comprueba la carpeta detectada en **Ajustes**; normalmente es `%APPDATA%\.minecraft`.
3. Pulsa **Instalar y preparar**. Descarga Java 21 si hace falta, instala NeoForge sin abrir un asistente, coloca los 36 mods del cliente y añade el servidor.
4. Pulsa **Jugar**. Se abre el launcher oficial: selecciona la instalación **PepaWorld 3.0**, inicia sesión allí si hace falta y pulsa **Jugar** en ese launcher. Dentro de Multijugador ya aparece PepaWorld 3.0.

El botón no accede a tu cuenta ni arranca el juego con una identidad inventada. El paso final en el launcher oficial es intencionado. Si acabas de instalar Minecraft por primera vez, abre una vez su launcher e inicia sesión antes de preparar PepaWorld. El launcher oficial descarga los recursos del juego que necesite al primer arranque.

La versión 0.1.1 detecta también Minecraft Launcher instalado desde Microsoft Store mediante su AppID de Windows. Si no lo encuentra, muestra un mensaje en lugar de abrir Bedrock. En Ajustes, deja vacío el campo de aplicación para utilizar la detección automática. La integración registra el perfil en `launcher_profiles.json` y también en `launcher_profiles_microsoft_store.json` cuando existe.

El instalador de prueba no está firmado con un certificado de editor. Windows puede mostrar un aviso de editor desconocido. Una versión de distribución profesional debe firmarse con tu certificado; no se desactivan protecciones del sistema.

El proyecto incluye ahora `npm run dist:win:signed` para compilar con un certificado instalado en Windows. Lee `docs/FIRMA-WINDOWS.md`. Se comprueba que la firma sea obligatoria; necesitas tu certificado real. El EXE 0.1.1 ya entregado continúa sin firmar. La firma no garantiza la desaparición inmediata de SmartScreen, que también evalúa reputación.

## Dónde se guarda

- Windows: `%APPDATA%\pepaworld-launcher\instance`.
- macOS: `~/Library/Application Support/pepaworld-launcher/instance`.
- El botón **Abrir carpeta del juego** muestra la ruta real, también visible en Ajustes.

Mods, configuraciones, opciones, mundos, capturas, shaders y lista de servidores quedan dentro de la instancia. En la carpeta Minecraft elegida solo se añaden bibliotecas/versiones y el perfil exclusivo `pepaworld-3`. Los otros perfiles, cuentas y tokens se conservan. El instalador nunca mete el modpack en el `mods` general.

**Actualizar con Minecraft y su launcher cerrados.** Se conservan los mundos, capturas, opciones y archivos no administrados. Los archivos de configuración incluidos sí pueden reemplazarse para mantener el pack coherente; se guardan antes en `backups`. Las actualizaciones no cambian la autenticación de Minecraft ni DirectAuth en el servidor.

## Actualizaciones online

La primera instalación usa los archivos incluidos y no necesita que hayas publicado el modpack. Sí necesita Internet para descargar Java/Minecraft/NeoForge.

La URL maestra configurada es **https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/version.json**. El repositorio utiliza un manifest completo y objetos identificados por SHA-256.

La versión 0.1.2 asigna esa URL una sola vez a los ajustes anteriores que no tenían canal. Conserva las URL personalizadas y los demás ajustes. Quienes sigan usando el ejecutable anterior pueden introducir la URL en Ajustes y pulsar Actualizar.

Lee `docs/ACTUALIZAR.md`: no hace falta recompilar el launcher cada vez que cambies un mod.

## Compilar

Necesitas Node.js LTS (24 o superior compatible con las dependencias fijadas) en el ordenador que compila. Los jugadores no necesitan Node.js, npm ni Python.

- Windows: doble clic en `COMPILAR-WINDOWS.bat`.
- macOS: ejecuta `COMPILAR-MAC.command` desde Terminal (`bash COMPILAR-MAC.command`). Genera un DMG para la arquitectura del Mac que compila. Para ambas arquitecturas, compila una vez en Intel y otra en Apple Silicon; también puedes usar el workflow incluido.
- Manual: `npm ci`, `npm test`, `npm run dist:win` o `npm run dist:mac`.
- Durante desarrollo: `npm start`.

El DMG debe compilarse y probarse en macOS. Esta entrega no afirma haberlo ejecutado ni notarizado. Para distribuirlo sin avisos de Apple hacen falta firma Developer ID y notarización; no se incluye ningún comando para desactivar Gatekeeper.

Hay un workflow manual de GitHub Actions en `.github/workflows/build.yml`. Si usas GitHub, sube el proyecto con los objetos de `release` mediante LFS cuando corresponda; los límites de archivos del servicio pueden impedir subir ciertos JAR sin LFS. También puedes compilar localmente, sin GitHub.

## Contenido para el administrador

- `src/`, `ui/`, `assets/`: código e imagen oficial.
- `pack/client/`: cliente limpio, 36 mods y archivos necesarios.
- `pack/excluded/`: originales excluidos para referencia; nunca se empaquetan en el instalador.
- `release/`: manifest y objetos SHA-256, incluidos en el instalador inicial y listos para subir a un alojamiento HTTPS. El ZIP del proyecto evita duplicar los JAR: ejecuta `npm run prepare:bundle` para reconstruir `objects/`; la compilación lo hace automáticamente.
- `tools/release.cjs`: generador de versiones.
- `docs/`: auditoría, inventario, dependencias, arquitectura y pruebas.
- `tests/`: pruebas automatizadas de actualización, recuperación, rutas, perfiles y NBT.

Para cambiar la versión de Minecraft o NeoForge se necesita una nueva versión del launcher, revisar dependencias y cambiar las constantes/validaciones correspondientes. El actualizador de mods no ejecuta comandos recibidos desde el manifest.

## Instalador incluido y recompilación

El EXE entregado se compila con `installer/windows.nsi` y NSIS nativo en Linux, a partir del mismo `dist/win-unpacked` de Electron. Incluye desinstalación por usuario y conserva los datos del juego. La compilación estándar `npm run dist:win` usa el asistente NSIS de electron-builder en Windows. Para reproducir exactamente el asistente entregado: `npx electron-builder --win --x64 --dir`, `node tools/uninstall-list.cjs` y `makensis installer/windows.nsi` con NSIS instalado. Ejecuta antes `npm run prepare:bundle`.

El nombre del EXE al compilar con electron-builder puede ser `PepaWorld-0.1.1-win-x64.exe`; el entregado con el asistente NSIS propio se llama `PepaWorld-0.1.1-Setup-win-x64.exe`.

## Corrección 0.1.1: botón Jugar

La versión anterior podía abrir Minecraft para Windows porque utilizaba el protocolo `minecraft://` cuando no encontraba el launcher clásico. Se ha eliminado ese comportamiento. Ahora detecta la aplicación Minecraft Launcher registrada en Windows y la abre mediante AppsFolder. En el launcher oficial, elige **Java Edition → PepaWorld 3.0 → Jugar**.

Para actualizar, cierra PepaWorld e instala la versión corregida en la misma carpeta, sin desinstalar previamente. El perfil, los mods ya preparados y la configuración del jugador permanecen en la carpeta de datos existente. El pie de la ventana muestra **Launcher 0.1.1**.

## Actualizar el propio launcher

Desde 0.2.0 aparece **Actualizar launcher** cuando hay una versión más reciente en GitHub. El botón descarga y verifica el instalador, permite abrirlo y cierra PepaWorld para instalarlo. Lee docs/ACTUALIZAR-LAUNCHER.md. La primera instalación de 0.2.0 debe hacerse manualmente.
