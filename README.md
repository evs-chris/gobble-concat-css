# gobble-concat-css

Concatenate CSS using [rework](https://github.com/reworkcss/rework) and the rework-imports plugin.

## Installation

First, you need to have gobble installed - see the [gobble readme](https://github.com/gobblejs/gobble) for details. Then, simply reference `'concat-css'` in a `transform`, and gobble will take care of getting the plugin installed.

## Usage

### Options

* sourcemap - boolean - defaults to true - whether or not to generate sourcemaps
* dest - string - defaults to `'bundle.css'` - the name of the file to output
* debug - boolean - `console.log` each url that is adjusted

```js
gobble('path-with-css').transform('concat-css', { dest: 'assets/bundle.css' });
```

## License

Copyright (c) 2014 Chris Reeves. Released under an [MIT license](https://github.com/evs-chris/gobble-giblets/blob/master/LICENSE.md).
