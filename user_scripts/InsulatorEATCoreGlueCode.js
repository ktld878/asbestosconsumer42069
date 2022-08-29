"use strict";
/*
 * This file is part of IodineGTA
 *
 * Copyright (C) 2012-2013 Grant Galitz
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */
var games = {
    "digimon_racing":"Digimon Racing",
    "doom":"Doom",
    "doom2":"Doom 2",
    "drilldozer":"Drill Dozer",
    "dukenukem":"Duke Nukem Advance",
    "dnd":"Dungeons And Dragons - Eye Of The Beholder",
    "grandtheft":"Grand Theft Auto Advance",
    "gunstar_super_heroes":"Gunstar Super Heroes",
    "hmfmt":"Harvest Moon - Friends of Mineral Town",
    "hmmfmt":"Harvest Moon - More Friends of Mineral Town",
    "iridion":"Iridion 3D",
    "kirbymirror":"Kirby & The Amazing Mirror",
    "kirbynightmare":"Kirby: Nightmare in Dreamland",
    "starwars":"Lego Star Wars",
    "mariokart":"Mario Kart: Super Circuit",
    "mortal_kombat":"Mortal Kombat Advance",
    "mkda":"Mortal Kombat: Deadly Alliance",
    "mother3":"Mother 3",
    "namelessfirered":"Nameless FireRed Project",
    "emeraldpatch":"Pokemon Emerald Patched Version",
    "clover":"Pokemon Clover",
    "pokemoncollection":"The Pokemon Gameboy Collection",
    "darkrising":"Pokemon: Dark Rising 1 (Fire Red Hack)",
    "darkrising2":"Pokemon: Dark Rising 2 (Fire Red Hack)",
    "pokemonemerald":"Pokemon Emerald",
    "pokemonek":"Pokemon Emerald (Kaizo Mod)",
    "pkmnsnakewood":"Pokemon Snakewood (Ruby Hack)",
    "eprp":"Pokemon Emerald Party Randomizer Plus",
    "pokemongreen":"Pokemon Leaf Green",
    "pokeprism":"Pokemon Prism (Mod)",
    "mysteryred":"Pokemon Mystery Dungeon Red",
    "pokemonruby":"Pokemon Ruby",
    "pokemonsapphire":"Pokemon Sapphire",
    "pokemonplatinum":"Pokemon Light Platinum (Ruby Mod)",
    "pokemonred":"Pokemon Fire Red",
    "pokemonpinball":"Pokemon Pinball - Ruby & Sapphire",
    "pokemonrocketstrike":"Pokemon Rocket Strike (Fire Red Mod)",
    "ultraviolet":"Pokemon Ultra Violet (Fire Red Mod)",
    "pokemonwaterblue":"Pokemon Water Blue (Fire Red Mod)",
    "gba_video_pokemon_1":"Pokemon Video Pak 1",
    "gba_video_pokemon_2":"Pokemon Video Pak 2",
    "gba_video_pokemon_3":"Pokemon Video Pak 3",
    "gba_video_pokemon_4":"Pokemon Video Pak 4",
    "rainbowsix":"Rainbow Six: Rogue Spear",
    "super_street_fighter_2_turbo_revival":"Super Street Fighter II: Turbo Revival",
    "super_street_fighter_3_alpha":"Super Street Fighter III: Alpha",
};
var Iodine = null;
var Blitter = null;
var Mixer = null;
var MixerInput = null;
var timerID = null;
window.onload = function () {
    if (!games[location.hash.substr(1)]) {
        alert("Invalid game request!");
        return;
    }
    //Initialize Iodine:
    Iodine = new GameBoyAdvanceEmulator();
    //Initialize the graphics:
    registerBlitterHandler();
    //Initialize the audio:
    registerAudioHandler();
    //Register the save handler callbacks:
    registerSaveHandlers();
    //Hook the GUI controls.
    registerGUIEvents();
    //Enable Sound:
    Iodine.enableAudio();
    //Download the BIOS:
    downloadBIOS();
}
function downloadBIOS() {
    downloadFile("Binaries/gba_bios.bin", registerBIOS);
}
function registerBIOS() {
    processDownload(this, attachBIOS);
    downloadROM(location.hash.substr(1));
}
function downloadROM(gamename) {
    Iodine.pause();
    showTempString("Downloading \"" + games[gamename] + ".\"");
    downloadFile("Binaries/" + gamename + ".gba", registerROM);
}
function registerROM() {
    clearTempString();
    processDownload(this, attachROM);
    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i)) {
        Iodine.disableAudio();
    }
    Iodine.play();
}
function registerBlitterHandler() {
    Blitter = new GlueCodeGfx();
    Blitter.attachCanvas(document.getElementById("emulator_target"));
    Blitter.setSmoothScaling(false);
    Iodine.attachGraphicsFrameHandler(function (buffer) {Blitter.copyBuffer(buffer);});
}
function registerAudioHandler() {
    Mixer = new GlueCodeMixer();
    MixerInput = new GlueCodeMixerInput(Mixer);
    Iodine.attachAudioHandler(MixerInput);
}
function registerGUIEvents() {
    addEvent("keydown", document, keyDown);
    addEvent("keyup", document, keyUpPreprocess);
    addEvent("unload", window, ExportSave);
    Iodine.attachSpeedHandler(function (speed) {
        document.title = games[location.hash.substr(1)] + " - " + speed;
    });
}
function lowerVolume() {
    Iodine.incrementVolume(-0.04);
}
function raiseVolume() {
    Iodine.incrementVolume(0.04);
}
function writeRedTemporaryText(textString) {
    if (timerID) {
        clearTimeout(timerID);
    }
    showTempString(textString);
    timerID = setTimeout(clearTempString, 5000);
}
function showTempString(textString) {
    document.getElementById("tempMessage").style.display = "block";
    document.getElementById("tempMessage").textContent = textString;
}
function clearTempString() {
    document.getElementById("tempMessage").style.display = "none";
}
//Some wrappers and extensions for non-DOM3 browsers:
function addEvent(sEvent, oElement, fListener) {
    try {    
        oElement.addEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.attachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}
function removeEvent(sEvent, oElement, fListener) {
    try {    
        oElement.removeEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.detachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}
