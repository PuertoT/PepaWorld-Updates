Unicode true
!include "MUI2.nsh"
Name "PepaWorld 3.0"
OutFile "../dist/PepaWorld-0.2.0-Setup-win-x64.exe"
InstallDir "$LOCALAPPDATA\Programs\PepaWorld"
RequestExecutionLevel user
SetCompressor zlib
BrandingText "PepaWorld 3.0"
Icon "../assets/icon.ico"
UninstallIcon "../assets/icon.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Bienvenido a PepaWorld 3.0"
!define MUI_WELCOMEPAGE_TEXT "Este asistente instala el launcher de PepaWorld 3.0.$\r$\n$\r$\nAl abrirlo podrás elegir la carpeta de Minecraft y preparar NeoForge y el modpack automáticamente.$\r$\n$\r$\nCierra el launcher de PepaWorld antes de instalar una actualización."
!define MUI_FINISHPAGE_RUN "$INSTDIR\PepaWorld 3.0.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Abrir PepaWorld 3.0"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Spanish"
Function .onInit
  System::Call 'kernel32::CreateMutexW(p 0, i 0, w "PepaWorldSetup") p .r1 ?e'
  Pop $0
  StrCmp $0 183 0 +3
    MessageBox MB_OK "Ya hay un instalador de PepaWorld abierto."
    Abort
FunctionEnd
Section "PepaWorld 3.0"
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "../dist/win-unpacked/*"
  WriteUninstaller "$INSTDIR\Desinstalar.exe"
  CreateDirectory "$SMPROGRAMS\PepaWorld 3.0"
  CreateShortcut "$SMPROGRAMS\PepaWorld 3.0\PepaWorld 3.0.lnk" "$INSTDIR\PepaWorld 3.0.exe"
  CreateShortcut "$SMPROGRAMS\PepaWorld 3.0\Desinstalar.lnk" "$INSTDIR\Desinstalar.exe"
  CreateShortcut "$DESKTOP\PepaWorld 3.0.lnk" "$INSTDIR\PepaWorld 3.0.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PepaWorld" "DisplayName" "PepaWorld 3.0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PepaWorld" "DisplayVersion" "0.1.1"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PepaWorld" "Publisher" "PepaWorld"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PepaWorld" "UninstallString" '"$INSTDIR\Desinstalar.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PepaWorld" "DisplayIcon" "$INSTDIR\PepaWorld 3.0.exe"
SectionEnd
Section "Uninstall"
  SetShellVarContext current
  ; Solo retira los archivos del programa. Mundos y datos del usuario se conservan.
  !include "uninstall-files.nsh"
  Delete "$INSTDIR\Desinstalar.exe"
  RMDir "$INSTDIR"
  Delete "$DESKTOP\PepaWorld 3.0.lnk"
  Delete "$SMPROGRAMS\PepaWorld 3.0\PepaWorld 3.0.lnk"
  Delete "$SMPROGRAMS\PepaWorld 3.0\Desinstalar.lnk"
  RMDir "$SMPROGRAMS\PepaWorld 3.0"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PepaWorld"
SectionEnd
