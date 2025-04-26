"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_js_1 = require("../store.js");
var game_js_1 = require("../game.js");
var node_fs_1 = require("node:fs");
var path = require("path");
var username = 'AndreRuperto'; // Coloque aqui seu username do GitHub
store_js_1.Store.config = {
    platform: 'github',
    username: username,
    outputFormat: 'svg',
    gameSpeed: 1,
    gameTheme: 'github',
    enableSounds: false,
    canvas: {}, // solução fake
    pointsIncreasedCallback: function () { },
    svgCallback: function (animatedSVG) {
        var outputPath = path.resolve('dist', 'pacman.svg');
        (0, node_fs_1.writeFileSync)(outputPath, animatedSVG, 'utf-8');
        console.log("\u2705 SVG gerado com sucesso em ".concat(outputPath));
    },
    gameOverCallback: function () {
        console.log('🎮 Game over (modo SVG finalizado)');
    },
};
game_js_1.Game.startGame(store_js_1.Store);
