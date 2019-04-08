import * as $c from "craydent";
import { GlobalConfig } from "@jest/types/build/Config";

const cwd = global.process.cwd();
const RED = '\x1b[31m%s\x1b[0m';
const GREEN = '\x1b[32m%s\x1b[0m';
const YELLOW = '\x1b[33m%s\x1b[0m';

export function process(src: string, filename: string, config: GlobalConfig) {
    let pkg = $c.include(`${config.rootDir}/package.json`);
    if (!pkg) {
        pkg = { 'jest-transform-multiple': $c.include(`${config.rootDir}/jtm.config.js`) };
    }
    if (!pkg || !pkg['jest-transform-multiple']) {
        return src;
    }

    let jconfig: JTMConfig | string[] = pkg['jest-transform-multiple'];
    let newSrc = src;
    if (Array.isArray(jconfig)) {
        for (let i = 0, len = jconfig.length; i < len; i++) {
            try {
                let mod = require(parsePath(jconfig[i]));
                newSrc = mod.process(newSrc, filename, config);
            } catch (e) {
                console.log(RED, e);
            }
        }
    } else if ($c.isObject(jconfig)) {
        let mods = jconfig.modules;
        for (let i = 0, len = mods.length; i < len; i++) {
            try {
                let mod = require(parsePath(mods[i].path));
                let tempConfig = $c.merge({}, config, mods[i].config || {});
                newSrc = mod.process(newSrc, filename, tempConfig);
            } catch (e) {
                console.log(RED, e);
            }
        }
    }
    return newSrc;
}

export function parsePath(path: string = '') {
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