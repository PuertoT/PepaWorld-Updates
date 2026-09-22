'use strict';
// electron-builder 26.0.12: conserva la configuración base del proyecto.
const base = require('../package.json').build;
const thumbprint = (process.env.PEPA_SIGN_CERT_SHA1 || '').replace(/\s/g, '').toUpperCase();
if (!/^[A-F0-9]{40}$/.test(thumbprint)) {
  throw new Error('Falta PEPA_SIGN_CERT_SHA1: indica la huella de tu certificado de firma de código instalado en Windows. Consulta docs/FIRMA-WINDOWS.md.');
}
module.exports = {
  ...base,
  forceCodeSigning: true,
  directories: { ...base.directories, output: 'dist-signed' },
  win: {
    ...base.win,
    signAndEditExecutable: true,
    signtoolOptions: {
      certificateSha1: thumbprint,
      signingHashAlgorithms: ['sha256']
    }
  }
};
