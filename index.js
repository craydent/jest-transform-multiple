let $c = require('craydent');
let RED = '\x1b[31m%s\x1b[0m';
let GREEN = '\x1b[32m%s\x1b[0m';
let YELLOW = '\x1b[33m%s\x1b[0m';


module.exports = {
    process(src, filename, config) {
        let options = config;
        let pkg = $c.include(`${config.rootDir}/package.json`);

        if (!pkg || !pkg['jest-transform-multiple']) {
            return src;
        }

        let jconfig = pkg['jest-transform-multiple'];
        let newSrc = src;
        if ($c.isArray(jconfig)) {
            for (let i = 0, len = jconfig.length; i < len; i++) {
                try {
                    let mod = require(parsePath(jconfig[i]));
                    newSrc = mod.process(newSrc, filename, config);
                } catch (e) {}
            }
        } else if ($c.isObject(jconfig)) {
            let mods = jconfig.modules;
            for (let i = 0, len = mods.length; i < len; i++) {
                try {
                    let mod = require(parsePath(mods[i].path));
                    let tempConfig = $c.merge({},config, mods[i].config || {});
                    newSrc = mod.process(newSrc, filename, tempConfig);
                } catch (e) {}
            }
        }
        return newSrc;
    }
}

function parsePath (path, rootDir){
    path = path || "";
    if (!path.indexOf('./')) {
        return require('path').join(rootDir, path);
    }
    if (~path.indexOf('<rootDir>')) {
        return path.replace('<rootDir>', rootDir);
    }
    if (path[0] == '/' && path.indexOf(rootDir)) {
        return rootDir + path;
    }
    return path;
}