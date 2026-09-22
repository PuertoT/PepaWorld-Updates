'use strict';
const {secureUrl}=require('./io.cjs');
// Activa el canal una vez para instalaciones anteriores sin URL configurada.
// Después respeta que el jugador lo cambie o lo deje vacío desde Ajustes.
function migrateUpdateChannel(settings,defaultUrl){
 if(settings.updateChannelMigration===1||!defaultUrl)return settings;
 secureUrl(defaultUrl);
 return {...settings,manifestUrl:settings.manifestUrl||defaultUrl,updateChannelMigration:1};
}
module.exports={migrateUpdateChannel};
