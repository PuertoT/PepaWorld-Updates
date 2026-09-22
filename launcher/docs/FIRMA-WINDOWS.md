# Firma del instalador Windows

## Estado actual

El EXE 0.1.1 entregado está sin firmar. La captura «Windows protegió su PC» muestra SmartScreen y «Editor desconocido». Esta actualización del proyecto prepara una compilación firmada; no convierte el EXE ya descargado en un instalador firmado.

Necesitas un certificado de firma de código de una autoridad reconocida, emitido a tu identidad o entidad, con acceso a su clave privada mediante el proveedor correspondiente. Un certificado autofirmado no establece confianza pública. No envíes claves privadas ni contraseñas por el chat.

SmartScreen considera la reputación del archivo y de la firma. Firmar identifica al editor y permite verificar la integridad, pero no garantiza que desaparezcan todos los avisos desde la primera descarga. No se modifica la protección del ordenador del jugador.

## Compilar con un certificado instalado en Windows

1. Instala el certificado y el software de su proveedor en el equipo Windows que compila. Si utiliza un token, conéctalo. Debe aparecer como certificado de firma de código y tener acceso a su clave privada.
2. Abre PowerShell en la raíz del proyecto y ejecuta `npm ci`.
3. Consulta la huella del certificado en su proveedor o con `Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert`. La huella identifica el certificado; no es una clave privada.
4. Configura la huella real y compila:

```powershell
$env:PEPA_SIGN_CERT_SHA1 = 'REEMPLAZAR_POR_LA_HUELLA_REAL_DE_40_CARACTERES'
npm test
if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas' }
npm run dist:win:signed
if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación firmada' }
```

El instalador se genera en `dist-signed`. Esta ruta usa electron-builder en Windows y firma tanto el ejecutable como el instalador y su desinstalador. Se exige firma con `forceCodeSigning`; no se acepta una compilación sin certificado como resultado satisfactorio. El hash de la firma es SHA-256; el SHA-1 de la variable solo selecciona el certificado. Se utiliza el sellado de tiempo de electron-builder.

La configuración está adaptada a electron-builder **26.0.12**, fijado en `package-lock.json`. No copies opciones de otra versión sin revisarlas. El comando normal `dist:win` y el workflow existente siguen generando compilaciones de prueba; para distribuir una versión firmada usa la ruta anterior.

## Verificar antes de distribuir

En PowerShell, desde la raíz del proyecto:

```powershell
$targets = @(Get-ChildItem .\dist-signed -File -Filter *.exe)
$targets += Get-Item '.\dist-signed\win-unpacked\PepaWorld 3.0.exe'
if ($targets.Count -lt 2) { throw 'Falta el instalador o el ejecutable' }
foreach ($file in $targets) {
    $signature = Get-AuthenticodeSignature -LiteralPath $file.FullName
    if ($signature.Status -ne 'Valid') { throw "Firma no válida: $($file.Name)" }
    if ($signature.SignerCertificate.Thumbprint -ne ($env:PEPA_SIGN_CERT_SHA1 -replace '\s', '')) {
        throw "Editor inesperado: $($file.Name)"
    }
    if (-not $signature.TimeStamperCertificate) { throw "Falta sello de tiempo: $($file.Name)" }
    $signature | Select-Object Path, Status, SignerCertificate
}
```

Comprueba además el instalador en un Windows limpio descargándolo desde el alojamiento real. No edites el EXE después de firmarlo. Regenera sus SHA-256 para publicar la descarga. El nombre mostrado como editor procede del certificado y puede diferir de la marca PepaWorld.

Validación de esta entrega: configuración comprobada contra el esquema de la dependencia instalada. No se ha ejecutado una firma real: no se dispone del certificado ni de un entorno Windows de firma.

## Botón Jugar: alcance actual

La captura del launcher oficial muestra **Minecraft: Java Edition**, instalación **PepaWorld 3.0** y versión **neoforge-21.1.250** seleccionadas correctamente. La versión 0.1.1 abre ese launcher y todavía requiere pulsar su botón verde **JUGAR**. No se ha implementado ni validado un arranque directo del juego desde PepaWorld. La captura no confirma que Minecraft haya cargado todos los mods; eso se comprueba tras pulsar JUGAR y entrar al servidor.

## Referencias

- [Microsoft: funcionamiento y reputación de SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/)
- [Microsoft: SignTool, firma y verificación](https://learn.microsoft.com/en-us/windows/win32/seccrypto/signtool)
- Configuración de la versión instalada: `node_modules/app-builder-lib/out/options/winOptions.d.ts`.
