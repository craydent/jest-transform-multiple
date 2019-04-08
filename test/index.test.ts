import { process, parsePath } from '../src/index'
import { GlobalConfig } from "@jest/types/build/Config";


const RED = "\x1b[31m%s\x1b[0m";
jest.mock('module');
const mod = require('module');

describe('Jest Transform Multiple', () => {
    describe('parsePath', () => {
        test('no args', () => {
            expect(parsePath()).toBe('');
        });
        describe('with path', () => {
            const cwd = global.process.cwd();
            test('starting with no prefix', () => {
                expect(parsePath('the/path')).toBe('the/path');
            });
            test('starting with ./', () => {
                expect(parsePath('./the/path')).toBe(`${cwd}/the/path`);
            });
            test('starting with <rootDir>', () => {
                expect(parsePath('<rootDir>/the/path')).toBe(`${cwd}/the/path`);
            });
            test('starting with / and does not start with cwd', () => {
                expect(parsePath('/the/path')).toBe(`${cwd}/the/path`);
            });
            test('starting with / and starts with cwd', () => {
                expect(parsePath(`${cwd}/the/path`)).toBe(`${cwd}/the/path`);
            });
        });
    });
    describe('process', () => {
        jest.mock('../package.json');
        let pkg = require('../package.json');
        beforeEach(() => {
            delete pkg['jest-transform-multiple'];
        })
        test('when package.json not found', () => {
            expect(process('src', '', { rootDir: '.' } as GlobalConfig)).toBe('src');
        });
        test('when jest-transform-multiple does not exist', () => {
            expect(process('src', '', { rootDir: '..' } as GlobalConfig)).toBe('src');
        });
        test('when jest-transform-multiple is invalid', () => {
            pkg['jest-transform-multiple'] = 'invaid';
            expect(process('src', '', { rootDir: '..' } as GlobalConfig)).toBe('src');
        });

        test('when jest-transform-multiple in jtm.config.js', () => {
            jest.mock('../__mocks__/jtm.config.js', () => ['module', 'module']);
            mod.process = jest.fn()
                .mockImplementationOnce((src) => { return `module ${src}`; })
                .mockImplementationOnce((src) => { return `module2 ${src}`; });
            expect(process('src', '', { rootDir: '../__mocks__' } as GlobalConfig)).toBe('module2 module src');
            expect(mod.process).toBeCalledWith('src', '', { rootDir: '../__mocks__' } as GlobalConfig);
        });

        test('when jest-transform-multiple is array', () => {
            pkg['jest-transform-multiple'] = ['module', 'module'];
            mod.process = jest.fn()
                .mockImplementationOnce((src) => { return `module ${src}`; })
                .mockImplementationOnce((src) => { return `module2 ${src}`; });
            expect(process('src', '', { rootDir: '..' } as GlobalConfig)).toBe('module2 module src');
            expect(mod.process).toBeCalledWith('src', '', { rootDir: '..' } as GlobalConfig);
        });

        test('when jest-transform-multiple is array with error', () => {
            let error = Error();
            const spy = jest.spyOn(global.console, 'log')
            pkg['jest-transform-multiple'] = ['module', 'module'];
            mod.process = jest.fn()
                .mockImplementationOnce((src) => { throw error; })
                .mockImplementationOnce((src) => { return `module2 ${src}`; });
            expect(process('src', '', { rootDir: '..' } as GlobalConfig)).toBe('module2 src');
            expect(mod.process).toHaveBeenNthCalledWith(1, 'src', '', { rootDir: '..' } as GlobalConfig);
            expect(spy).toBeCalledWith(RED, error);
            expect(mod.process).toHaveBeenNthCalledWith(2, 'src', '', { rootDir: '..' } as GlobalConfig);
        });
        test('when jest-transform-multiple is object', () => {
            pkg['jest-transform-multiple'] = {
                modules: [
                    { path: 'module', config: { prop: 'value' } },
                    { path: 'module', config: { prop: 'value2' } },
                    { path: 'module' }
                ],
                config: { globalProp: 'global value' }
            };
            mod.process = jest.fn()
                .mockImplementationOnce((src) => { return `module ${src}`; })
                .mockImplementationOnce((src) => { return `module2 ${src}`; })
                .mockImplementationOnce((src) => { return `module3 ${src}`; });
            expect(process('src', '', { rootDir: '..' } as GlobalConfig)).toBe('module3 module2 module src');
            expect(mod.process).toHaveBeenNthCalledWith(1, 'src', '', { rootDir: '..', prop: 'value' } as any);
            expect(mod.process).toHaveBeenNthCalledWith(2, 'module src', '', { rootDir: '..', prop: 'value2' } as any);
            expect(mod.process).toHaveBeenNthCalledWith(3, 'module2 module src', '', { rootDir: '..' } as any);
        });
        test('when jest-transform-multiple is object with error', () => {
            let error = Error();
            const spy = jest.spyOn(global.console, 'log')
            pkg['jest-transform-multiple'] = {
                modules: [
                    { path: 'module', config: { prop: 'value' } },
                    { path: 'module', config: { prop: 'value2' } }
                ],
                config: { globalProp: 'global value' }
            };
            mod.process = jest.fn()
                .mockImplementationOnce((src) => { throw error; })
                .mockImplementationOnce((src) => { return `module2 ${src}`; });
            expect(process('src', '', { rootDir: '..' } as GlobalConfig)).toBe('module2 src');
            expect(mod.process).toHaveBeenNthCalledWith(1, 'src', '', { rootDir: '..', prop: 'value' } as any);
            expect(spy).toBeCalledWith(RED, error);
            expect(mod.process).toHaveBeenNthCalledWith(2, 'src', '', { rootDir: '..', prop: 'value2' } as any);
        });
    });
});