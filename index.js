var rework = require('rework');
var imprt = require('rework-import');

function concatCss(indir, outdir, opts) {
  var sander = this.sander,
      dest = opts.dest || 'bundle.css',
      map = dest + '.map',
      sourcemap = opts.sourcemap !== false;

  return sander.lsr(indir).then(function(files) {
    var str = files
      .filter(function(f) { return /\.css$/.test(f); })
      .map(function(f) { return '@import "./' + indir.replace(process.cwd(), '') + '/' + f + '";'; })
      .join('\n');
    var output = rework(str).use(imprt()).toString(sourcemap ? { sourcemap: true, sourcemapAsObject: true } : {});
    output.code += '\n' + '/*# sourceMappingURL=' + map + ' */';

    return sander.writeFile(outdir, dest, output.code)
      .then(function() {
        return sander.writeFile( outdir, map, JSON.stringify(output.map) );
      });
  });
}

module.exports = concatCss;
