# Launcher 0.1.3: Minecraft sin consola de Java

En Windows, el perfil del juego usa `javaw.exe` del mismo JDK 21 seleccionado, si existe. Las comprobaciones de versión y la instalación de NeoForge siguen usando `java.exe` con procesos ocultos y captura de salida. No se cambia la instalación de Java ni la memoria asignada.

Se actualizan únicamente los perfiles de PepaWorld en los archivos de perfiles estándar y de Microsoft Store; se conservan cuentas, preferencias y perfiles ajenos. Si un runtime no contiene javaw.exe, se mantiene su ejecutable anterior.

Incluye el modpack 3.0.1, revisión 3, con el JAR de SecurityCraft elegido por Puerto. La revisión 3 resuelve el conflicto con instalaciones previas 3.0.0-preview.2 que ya usaban revisión 2.

Instalar el nuevo launcher con PepaWorld cerrado. Al pulsar Actualizar con Minecraft y su launcher cerrados se registra el perfil sin consola. Una partida ya arrancada con java.exe conserva su consola hasta salir del juego; cerrarla a mano puede terminar Minecraft.

Validación: 26 pruebas correctas, ninguna fallida y una omitida en Windows. Incluye pruebas de javaw, rutas con espacios, ambos archivos de perfiles y conservación de ajustes ajenos. No se ha iniciado una nueva partida gráfica durante esta corrección.
