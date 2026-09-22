# Auditoría de PepaWorld 3.0

Fecha: 20/09/2026. Objetivo: Minecraft Java 1.21.1 + NeoForge 21.1.250, Java 21.

## Resultado

El ZIP contiene 78 entradas, 63 archivos y 39 JAR de primer nivel. Se han comprobado los CRC del ZIP y todos los JAR (incluidos los anidados), leído los metadatos NeoForge/Fabric, dependencias, manifiestos, configuraciones y scripts, y validado JSON/TOML e imágenes. Es una auditoría estática, no una certificación de ejecución ni un análisis completo de seguridad del bytecode.

Se han evaluado 247 relaciones obligatorias mediante `org.apache.maven.artifact.versioning.VersionRange` de Maven 3.8.5, el utilizado por FML: 245 aceptan las versiones disponibles directamente y 2 (JEI/Iris) mediante la matriz de compatibilidad de FML. No faltan IDs obligatorios. Las variables de la ruleta se aceptan como texto por Maven, pero eso no valida que la carga mixta Fabric/NeoForge funcione.

El cliente depurado conserva 36 mods. Se excluyen 3 JAR por su función, 5 copias .bak, 4 configuraciones -server.toml y el script de ejemplo. No se cambian versiones de mods ni reglas del servidor. Se conserva una copia de todo lo excluido en el proyecto del administrador. La portada se integra sin modificarla; El Hoyo aparece en ella como zona, no como nombre de servidor.

## Hallazgos concretos

- **Wheel Of Wacky:** variables `${minecraft_version}` y `${fabric_version}` sin resolver en el TOML. No son inventadas por el launcher: el JAR coincide por SHA-512 con la publicación 0.2.2 del autor. Conservamos Connector, Forgified Fabric API y la librería Kaleido anidada. No se cambia a 0.2.3 unilateralmente porque el servidor debe seguir siendo compatible. Hace falta prueba real de carga; no se declara resuelto con un parche de metadatos.
- **JEI e Iris:** el rango Maven literal acaba en 1.21.1 excluido, pero el código de FML 4.0.44 (`VersionSupportMatrix`) permite probar 1.21 cuando se ejecuta 1.21.1. Por ello no se consideran un bloqueo por rango. Iris declara internamente `1.8.12-snapshot+mc1.21.1-local`, distinto de su nombre comercial.
- **SecurityCraft:** el nombre empieza por `[26.2]`, pero el interior admite Minecraft 1.21.1 y NeoForge 21.1.250. `Implementation-Version` es 1.10.2. Se mantiene exactamente el JAR del servidor y se registra su hash; no se renombra para ocultar la discrepancia.
- **Discord Presence:** es el mod de bh679 con webhook/bot, no otro proyecto homónimo de Discord Rich Presence. Incluye clases de cliente, HUD y encuestas: no se etiqueta como estrictamente exclusivo de servidor. Se omite de la distribución base; si el servidor usa esas funciones opcionales, habrá que incluirlo de nuevo tras comprobarlas. El ZIP no trae su archivo de secretos.
- **FTB Backups 3:** puede funcionar con servidor integrado y tiene configuración de cliente. Se excluye por ser innecesario para este cliente multijugador, no por afirmar que nunca carga en cliente.
- **DirectAuth:** código de login de servidor y mixins en login/PlayerList, sin clases de cliente. Se omite; no se toca el servidor, no se eliminan sus contraseñas ni su autenticación.
- **JourneyMap:** Common Networking está anidado; no debe declararse ausente por no ver un JAR separado.
- **Iron's Lib:** `4.7.5.1` es una recomendación Maven sin corchetes, no la exigencia estricta `[4.7.5.1]`. GeckoLib 4.9.2 también supera el mínimo de Spellbooks.
- **Terralith/Lithostitched:** generación de terreno prescindible para conectarse; se conserva por coherencia y para no alterar la experiencia local. No se confunde generación de servidor con prohibición de cargarlo en cliente.
- El ZIP no contiene mundo, playerdata, cuentas del launcher, Java, NeoForge, `server.properties`, scripts KubeJS de servidor ni LootJS. No se inventan ni se añaden desde otras conversaciones.

## Clasificación por archivo

`side = BOTH` de una dependencia describe dónde se comprueba esa dependencia; no demuestra por sí mismo que el mod sea obligatorio en ambos lados.

| Archivo | ID / versión interna | Uso | Decisión | Evidencia / límite |
|---|---|---|---|---|
| `CustomNPCs-Unofficial-NeoForge-1.21.1.20241226.jar` | customnpcs / 1.21.1.20241226 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `GlitchCore-neoforge-1.21.1-2.1.0.2.jar` | glitchcore / 2.1.0.2 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `L_Ender's Cataclysm 1.21.1-3.33.jar` | cataclysm / 3.33 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `SereneSeasons-neoforge-1.21.1-10.1.0.3.jar` | sereneseasons / 10.1.0.3 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `Terralith_1.21.1_v2.6.2_Neoforge.jar` | terralith / 2.6.2 | Ambos / opcional | Incluir | Generación del mundo: no necesario para entrar; se conserva para coherencia y mundos locales. |
| `[26.2] SecurityCraft v1.10.2.1.jar` | securitycraft / 1.10.2 | Compartido / dependencia | Incluir | Nombre del archivo engañoso: el interior declara Minecraft [1.21.1,1.22), NeoForge ≥21.1.206 y versión 1.10.2, no 1.10.2.1. |
| `architectury-13.0.11-neoforge.jar` | architectury / 13.0.11 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `astages-2.5.3-1.21.1.jar` | astages / 2.5.3-1.21.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `astages_curios-2.0.0-1.21.1.jar` | astages_curios / 2.0.0-1.21.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `balm-neoforge-1.21.1-21.0.65.jar` | balm / 21.0.65 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `connector-2.0.0-beta.17+1.21.1-full.jar` | connector / 2.0.0-beta.17+1.21.1 | Compartido / dependencia | Incluir | Mod interno en jarjar. Necesario para la ruleta Fabric. |
| `corpse-neoforge-1.21.1-1.1.13.jar` | corpse / 1.21.1-1.1.13 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `curios-neoforge-9.5.1+1.21.1.jar` | curios / 9.5.1+1.21.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `directauth-1.2.0.jar` | directauth / 1.2.0 | Servidor / función opcional | Excluir | Autenticación del servidor. Metadatos y mixins ServerLogin/PlayerList; sin clases de cliente. Se excluye del cliente sin tocar la autenticación del servidor. |
| `discordpresence-neoforge-0.58.0.jar` | discordpresence / 0.58.0 | Servidor / función opcional | Excluir | Integración del servidor con Discord según el README del autor bh679. Contiene también funciones opcionales de cliente; NO es el mod homónimo de Rich Presence. Se omite del pack base; confirmar si se usan sus encuestas/HUD/chat. |
| `ferritecore-7.0.3-neoforge.jar` | ferritecore / 7.0.3 | Ambos / opcional | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `forgified-fabric-api-0.116.15+2.3.5+1.21.1.jar` | fabric_api / 0.116.15+2.3.5+1.21.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `ftb-backups-3-21.1.5.jar` | ftbbackups3 / 21.1.5 | Servidor / función opcional | Excluir | Copias de mundos en servidor dedicado/integrado. Tiene configuración de cliente; no es estrictamente exclusivo de servidor. Se omite al no necesitar respaldar mundos locales para entrar al servidor. |
| `ftb-library-neoforge-2101.1.36.jar` | ftblibrary / 2101.1.36 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `ftb-quests-neoforge-2101.1.36.jar` | ftbquests / 2101.1.36 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `ftb-teams-neoforge-2101.1.11.jar` | ftbteams / 2101.1.11 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `geckolib-neoforge-1.21.1-4.9.2.jar` | geckolib / 4.9.2 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `iris-neoforge-1.8.12+mc1.21.1.jar` | iris / 1.8.12-snapshot+mc1.21.1-local | Cliente / utilidad opcional | Incluir | Rango literal excluye 1.21.1; FML 4.0.44 acepta compatibilidad con 1.21. Iris se identifica como snapshot local. |
| `irons_lib-1.21.1-2.1.0.jar` | irons_lib / 1.21.1-2.1.0 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `irons_spellbooks-1.21.1-3.16.3.jar` | irons_spellbooks / 1.21.1-3.16.3 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `jei-1.21.1-neoforge-19.51.0.418.jar` | jei / 19.51.0.418 | Cliente / utilidad opcional | Incluir | Rango literal excluye 1.21.1; FML 4.0.44 acepta compatibilidad con 1.21. Iris se identifica como snapshot local. |
| `journeymap-neoforge-1.21.1-6.0.8.jar` | journeymap / 1.21.1-6.0.8 | Cliente / utilidad opcional | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `kubejs-neoforge-2101.7.2-build.377.jar` | kubejs / 2101.7.2-build.377 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `lightmanscurrency-1.21-2.3.0.5.jar` | lightmanscurrency / 1.21-2.3.0.5 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `lionfishapi-3.1.jar` | lionfishapi / 3.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `lithostitched-1.7.13-neoforge-21.1.jar` | lithostitched / 1.7.13 | Ambos / opcional | Incluir | Dependencia declarada por Terralith. Se conserva junto a él. |
| `lootr-neoforge-1.21.1-1.11.38.125.jar` | lootr / 1.21.1-1.11.38.125 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `openhud-neoforge-1.3.1+1.21.1.jar` | openhud / 1.3.1+1.21.1 | Cliente / utilidad opcional | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `player-animation-lib-forge-2.0.4+1.21.1.jar` | playeranimator / 2.0.4+1.21.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `rhino-2101.2.7-build.85.jar` | rhino / 2101.2.7-build.85 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `sodium-neoforge-0.6.13+mc1.21.1.jar` | sodium / 0.6.13+mc1.21.1 | Cliente / utilidad opcional | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `wacky_wheel-0.2.2.jar` | wacky_wheel / 0.2.2 | Compartido / dependencia | Incluir | Original de Modrinth verificado por SHA-512; Fabric y TOML NeoForge; variables sin expandir. Prueba de carga pendiente. |
| `waystones-neoforge-1.21.1-21.1.45.jar` | waystones / 21.1.45 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |
| `xp_obelisk-neoforge-0.5.0+1.21.1.jar` | xps / 0.5.0+1.21.1 | Compartido / dependencia | Incluir | Metadatos internos, clases y dependencias; no implica que el servidor exija este mod. |

## Archivos y valores conservados

KubeJS: idiomas de Hoyocoin, textura de esmeralda y script de alimentación, con sus valores originales. Solo se corrige el nombre del servidor en el comentario de cabecera. Se excluye el ejemplo `Hello, World!`. AStages, Curios common, CustomNPCs, Serene Seasons y Waystones se conservan; los comentarios originales se mantienen como evidencia y no se cambian sus valores. Shaders: `superDuperVanilla.zip` incluido, sin activarlo automáticamente. No se distribuyen `servers.dat` ajenos: el launcher crea/fusiona uno en su instancia y conserva otros servidores que el jugador añada.

El inventario completo CSV/JSON justifica la decisión para cada archivo e incluye tamaño y SHA-256 original. `metadatos-mods.json` contiene los JAR anidados, incluidos los que no son mods de Minecraft. `dependencias.json` enumera las relaciones obligatorias y el resultado de la comprobación.

## Fuentes primarias

- [Guía de NeoForge](https://docs.neoforged.net/user/docs/) y [perfil aislado](https://docs.neoforged.net/user/docs/client/).
- [Instalador oficial 21.1.250](https://maven.neoforged.net/releases/net/neoforged/neoforge/21.1.250/neoforge-21.1.250-installer.jar): `--help`, `install_profile.json` y `version.json` inspeccionados.
- [Código fuente FML 4.0.44](https://maven.neoforged.net/releases/net/neoforged/fancymodloader/loader/4.0.44/loader-4.0.44-sources.jar): `VersionSupportMatrix.java`.
- [Wheel Of Wacky 0.2.2](https://modrinth.com/mod/wheel-of-wacky/version/Y1nSSFIq): archivo original y dependencias consultados por API.
- [Discord Presence del autor correcto](https://github.com/bh679/discordpresence-mc): README y metadatos del JAR adjunto.

## Pendiente antes de repartirlo a todos

Abrir el cliente con cuenta propia desde el launcher oficial, revisar que no hay errores de carga y entrar en `45.43.163.21:25570`. Comprobar la ruleta, NPC, magia, etapas, JEI, cadáveres, misiones y Hoyocoin. Probar Windows con una carpeta Minecraft con espacios; probar Mac Intel/Apple Silicon, con shaders desactivados inicialmente. La compilación del instalador no sustituye esta prueba gráfica y de conexión.

La instalación automática oficial de NeoForge se completó en el entorno de pruebas Linux. El informe `PRUEBAS.md` distingue esta comprobación de la ejecución del cliente gráfico y la conexión al servidor, pendientes.
