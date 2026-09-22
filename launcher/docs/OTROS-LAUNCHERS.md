# Otros launchers

El camino automático preparado es **Minecraft Launcher oficial**: se instala NeoForge, se crea el perfil y se abre la aplicación. Toda la autenticación queda en el launcher elegido.

La opción **Otro launcher** abre un ejecutable o una aplicación `.app` con una lista de argumentos; nunca ejecuta una cadena mediante una shell. Admite sustituciones `{gameDir}`, `{minecraftDir}` y `{version}`. Los argumentos concretos dependen del programa y deben comprobarse en su documentación.

## Launchers que leen las instalaciones del launcher oficial

Si tu launcher utiliza `launcher_profiles.json`, `versions` y `libraries` de una carpeta Minecraft, selecciona esa carpeta en Ajustes y elige su ejecutable. Debería poder seleccionar el perfil PepaWorld creado; esa compatibilidad se debe probar en el launcher concreto. No se declara soporte universal.

## Prism, MultiMC y launchers con formato propio de instancias

No leen necesariamente los perfiles oficiales. Esta versión no crea automáticamente sus formatos particulares. Se puede abrir su aplicación, pero para jugar deberá existir una instancia compatible que use **exactamente la carpeta de juego administrada por PepaWorld** y NeoForge 21.1.250, o desarrollar un adaptador específico.

No uses una importación que copie los mods a otra carpeta y esperes que se actualice sola: el actualizador solo administra la instancia mostrada en Ajustes. Para cumplir el recorrido sin copias manuales, usa de momento el launcher oficial o uno que consuma sus perfiles y directorios. No se inventan parámetros de Prism ni se importan, crean o transfieren sesiones de usuario.
