# gobble-concat-css

Concatenate CSS using [rework](https://github.com/reworkcss/rework) and the rework-imports plugin.

## Installation

First, you need to have gobble installed - see the [gobble readme](https://github.com/gobblejs/gobble) for details. Then, simply reference `'concat-css'` in a `transform`, and gobble will take care of getting the plugin installed.

## Usage

You can use this transform in two modes.

1. The first finds all of the css files available in the gobble nodes that it is handed and concatenates them. This is fine if you have a bunch of unrelated styesheets that you just want globbed together.
2. If some of the stylesheets are interrelated (via `@import`) or you need to control the order in which they are concatenated, you can create an entry file that references all of the files you need and specify it as an entry point.

If no `entry` option is specified, then the first mode will be used. 

### Options

* `sourcemap` - boolean - defaults to true - whether or not to generate sourcemaps - alias `sourceMap` to match other plugin convention
* `dest` - string - defaults to `'bundle.css'` - the name of the file to output
* `debug` - boolean - `console.log` each url that is adjusted
* `entry` - string - name of the file from which to start - if not specified an entry `@import`ing all available css files will be created for you

```js
gobble('path-with-css').transform('concat-css', { dest: 'assets/bundle.css' });
```

## License

Copyright (c) 2014 Chris Reeves. Released under an [MIT license](https://github.com/evs-chris/gobble-giblets/blob/master/LICENSE.md).
