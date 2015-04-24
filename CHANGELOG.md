## 0.1.0

* Allow specifying an entry point, in addition to the default mode of creating one containing an import for all css files automatically.

## 0.0.3

* __BUG__: Fix relativity of the sourceMappingURL in the end comment.
* Wrap the sourceMappingURL comment end to the next line to avoid having the sourcemap flattener try to find a file with a space and an asterisk appended.

## 0.0.2

* __BUG?:__ Adjust `url()`s before bundling.

## 0.0.1

Initial version
