<img src="http://craydent.com/JsonObjectEditor/img/svgs/craydent-logo.svg" width=75 height=75/>

# Jest Transform Multiple
**by Clark Inada**

This module is an extention for Jest and provides a simple way to run multiple transforms.

#### Usage
Configuration in package.json
```ts
// this is the root of the package.json
{
    "jest-transform-multiple": string[] | {

        modules:[
            {
                path:string;
                config: object;
            }
        ];
        config:object;
    }
}
```

```js
// this is the "jest" part of the package.json
{
    "jest":{
        ...otherJestOptions,
        "transform": {
            ".*test.*": "jest-transform-multiple"
        }
    }
}
```

## Examples
Array of strings
```js
{
    "jest-transform-multiple": ["module1", "module2"]
}
```
With configs
```js
{
    "jest-transform-multiple": {
        "modules": [
            {
                "path": "<rootDir>/tranforms.js",
                "config": { "hello2": "world2" }
            }
        ],
        "config": {
            "hello":"world",
            "hello2":"world"
        }
    }
}
```
In the example above, the config will be merged and yield the following when the process method is invoked:
```js
{
    ...configPassedFromJest
    "hello":"world",
    "hello2":"world2"
}
```

## Download

 * [GitHub](https://github.com/craydent/jest-transform-multiple)
 * [BitBucket](https://bitbucket.org/cinada/jest-transform-multiple)
 * [GitLab](https://gitlab.com/craydent/jest-transform-multiple)

Jest Transform Multiple is released under the [licensed under the MIT license].