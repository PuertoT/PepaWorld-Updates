# Pruebas y límites de esta entrega

## Ejecutado

- Integridad del ZIP original y sus 39 JAR, incluidos 67 JAR anidados. Sintaxis de las configuraciones JSON/TOML, lectura de scripts y recursos, inspección del ZIP de shaders.
- 247 comprobaciones de dependencias con la clase Maven utilizada por NeoForge: 245 directas y 2 mediante la excepción de compatibilidad Minecraft 1.21 de FML 4.0.44. Ningún ID obligatorio ausente.
- Comparación SHA-512 de Wheel Of Wacky 0.2.2 con el archivo publicado por el autor: coincide.
- **15 pruebas automatizadas Node superadas**: actualización incremental, reparación, retirada de administrados, preservación de archivos ajenos, rechazo de rutas inválidas, hashes/tamaños, reintentos, HTTPS, duplicados Windows, enlaces, rollback y recuperación de journal. NBT gzip/sin comprimir, conservación de otros servidores e idempotencia. Perfiles existentes y datos de autenticación conservados.
- Instalación de los **50 archivos reales** del cliente limpio en una instancia de prueba: 50 copiados. Segunda ejecución: **0 cambios**.
- Empaquetado real de la aplicación Windows x64 con Electron y compilación del instalador NSIS.

## Instalación real de NeoForge completada

Se descargó Java 21 de Adoptium y se verificó su SHA-256. Se descargaron los metadatos/JAR cliente de Minecraft 1.21.1 y el instalador oficial NeoForge 21.1.250, verificando sus hashes. Se ejecutó realmente `--installClient`, se descargaron y comprobaron las bibliotecas y se ejecutaron los procesadores de transformación. Resultado del instalador: **Successfully installed client into launcher**. Se verificó la copia de bibliotecas y versión a la carpeta Minecraft de prueba.

El primer intento falló por DNS restringido en Java. En el entorno de pruebas se configuró la ruta proxy ya disponible y se reintentaron dos bibliotecas que habían fallado; así terminó correctamente. Esos ajustes de red del entorno no están codificados en el launcher distribuido.

La prueba valida la preparación en Linux, no equivale a ejecutar Minecraft en Windows ni a entrar al servidor.

## Interfaz

Se abrió la interfaz local en Chromium sin errores de JavaScript; se comprobó el diálogo de Ajustes, su cierre y el cambio de estado de los botones usando un puente IPC simulado. Se revisaron visualmente las capturas del launcher y sus ajustes. La captura no representa una conexión al servidor ni un Minecraft ya arrancado.

## No ejecutado

- El instalador `.exe` dentro de un Windows real.
- Arranque gráfico del Minecraft modificado o conexión al servidor.
- Inicio de sesión: queda en el launcher del jugador y no se ha manipulado.
- Compilación, firma, notarización o ejecución del DMG en macOS.
- Canal de actualizaciones público: no hay URL proporcionada ni alojamiento publicado.

## Prueba de aceptación en el PC de Puerto

1. Instalar el EXE, comprobar la carpeta Minecraft y pulsar Instalar y preparar con el juego/launcher cerrados.
2. Confirmar que aparece PepaWorld 3.0 en las instalaciones del launcher oficial y que apunta a la carpeta aislada.
3. Iniciar sesión en el launcher oficial, arrancar el perfil y comprobar el menú multijugador con el servidor añadido.
4. Entrar y probar ruleta, NPC, magia, etapas, cadáveres y misiones. Revisar `latest.log` y cualquier informe de cierre.
5. Configurar un canal HTTPS de prueba y publicar una revisión con un archivo de configuración de prueba. Comprobar que solo descarga ese cambio y conserva opciones/servidores del jugador.
6. Repetir en otro PC limpio antes de repartirlo a los demás. Si se ofrecen Macs, repetir en las arquitecturas que se vayan a soportar.

## Corrección 0.1.1

22 pruebas automatizadas superadas (15 anteriores y 7 de regresión). Se simulan instalaciones con Java Launcher y Bedrock juntos, solo Bedrock, aplicación clásica, fallo de PowerShell, rutas manuales y AppIDs ambiguos. Se comprueba que la llamada final apunta a Minecraft Launcher y que no existe el protocolo Bedrock en el código de apertura. El caso Microsoft Store se ha verificado con pruebas simuladas; la ejecución real en el Windows del jugador sigue pendiente.

Fuentes de la integración: [Get-StartApps](https://learn.microsoft.com/en-us/powershell/module/startlayout/get-startapps) y [AUMID de aplicaciones instaladas](https://learn.microsoft.com/en-us/windows/configuration/store/find-aumid).
