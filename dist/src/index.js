"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $c = require("craydent");
var cwd = global.process.cwd();
var RED = '\x1b[31m%s\x1b[0m';
var GREEN = '\x1b[32m%s\x1b[0m';
var YELLOW = '\x1b[33m%s\x1b[0m';
function process(src, filename, config) {
    var pkg = $c.include(config.rootDir + "/package.json");
    if (!pkg) {
        pkg = $c.include(config.rootDir + "/jtm.config.js");
    }
    if (!pkg || !pkg['jest-transform-multiple']) {
        return src;
    }
    var jconfig = pkg['jest-transform-multiple'];
    var newSrc = src;
    if (Array.isArray(jconfig)) {
        for (var i = 0, len = jconfig.length; i < len; i++) {
            try {
                var mod = require(parsePath(jconfig[i]));
                newSrc = mod.process(newSrc, filename, config);
            }
            catch (e) {
                console.log(RED, e);
            }
        }
    }
    else if ($c.isObject(jconfig)) {
        var mods = jconfig.modules;
        for (var i = 0, len = mods.length; i < len; i++) {
            try {
                var mod = require(parsePath(mods[i].path));
                var tempConfig = $c.merge({}, config, mods[i].config || {});
                newSrc = mod.process(newSrc, filename, tempConfig);
            }
            catch (e) {
                console.log(RED, e);
            }
        }
    }
    return newSrc;
}
exports.process = process;
function parsePath(path) {
    if (path === void 0) { path = ''; }
    if (!path.indexOf('./')) {
        return require('path').join(cwd, path);
    }
    if (~path.indexOf('<rootDir>')) {
        return path.replace('<rootDir>', cwd);
    }
    if (path[0] == '/' && !path.startsWith(cwd)) {
        return cwd + path;
    }
    return path;
}
exports.parsePath = parsePath;
//# sourceMappingURL=index.js.map