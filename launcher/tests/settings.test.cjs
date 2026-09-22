'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {migrateUpdateChannel}=require('../src/settings.cjs');
const url='https://raw.githubusercontent.com/PuertoT/PepaWorld-Updates/main/version.json';
test('Activa la URL en ajustes antiguos sin modificar carpetas ni preferencias',()=>{
 for(const manifestUrl of ['',undefined]){
  const old={manifestUrl,gameDir:'C:/Pepa/instance',memoryGB:8,launcherMode:'external'};
  const next=migrateUpdateChannel(old,url);
  assert.deepEqual(next,{...old,manifestUrl:url,updateChannelMigration:1});
  assert.equal(old.manifestUrl,manifestUrl);
 }
});
test('Conserva un canal personalizado y permite desactivarlo tras la migración',()=>{
 const custom={manifestUrl:'https://example.com/custom.json'};
 const migrated=migrateUpdateChannel(custom,url);
 assert.equal(migrated.manifestUrl,custom.manifestUrl);
 const disabled={...migrated,manifestUrl:''};
 assert.equal(migrateUpdateChannel(disabled,url),disabled);
 assert.equal(migrateUpdateChannel(migrated,url),migrated);
});
test('La migración exige HTTPS y no consume la migración si falta URL predeterminada',()=>{
 const old={manifestUrl:''};
 assert.equal(migrateUpdateChannel(old,''),old);
 assert.throws(()=>migrateUpdateChannel(old,'http://example.com/version.json'),/HTTPS/);
});
