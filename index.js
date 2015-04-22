var rework = require('rework');
var imprt = require('rework-import');
var url = require('rework-plugin-url');
var path = require('path');

var absolute = /^\s*\w+:\/\//;
var css = /\.css$/;

function concatCss(indir, outdir, opts) {
  var sander = this.sander,
      dest = opts.dest || 'bundle.css',
      map = dest + '.map',
      sourcemap = opts.sourcemap !== false,
      ctx = this,
      root = path.dirname(dest)
        .split('/')
        .filter(function(p) { return p !== '.'; })
        .map(function() { return '..'; })
        .join('/');

  return sander.lsr(indir).then(function(files) {
    var others = files.filter(function(f) { return !css.test(f); });
    files = files.filter(function(f) { return css.test(f); });
    ctx.log('finding css files...');
    var step1 = sander.Promise.all(files.map(function(f) {
      return sander.readFile(indir, f).then(function(content) {
        var fn = function(u) {
          var res;
          if (absolute.test(u)) res = u;
          else res = path.join(root, path.dirname(f), u);
          if (opts.debug) console.log('replacing', u, 'with', res);
          return res;
        };
        return sander.writeFile(outdir, f, rework(content.toString()).use(url(fn)).toString());
      });
    }));

    return step1.then(function() {
      ctx.log('bundling css...');
      var str = files
        .map(function(f) { return '@import "./' + outdir.replace(process.cwd(), '') + '/' + f + '";'; })
        .join('\n');
      var output = rework(str).use(imprt()).toString(sourcemap ? { sourcemap: true, sourcemapAsObject: true } : {});
      output.code += '\n' + '/*# sourceMappingURL=' + path.basename(map) + '\n */';

      // delete leftover files from step1
      ctx.log('cleaning up...');
      return Promise.all(files.map(function(f) { return sander.unlink(outdir, f); })).then(function() {
        // write out the bundle
        ctx.log('saving bundle...');
        return sander.writeFile(outdir, dest, output.code)
          .then(function() {
            ctx.log('saving source map...');
            return sander.writeFile(outdir, map, JSON.stringify(output.map)).then(function() {
              ctx.log('copying other files...');
              return Promise.all(others.map(function(f) { sander.link(indir, f).to(outdir, f); }));
            });
          });
      });
    });
  });
}

module.exports = concatCss;
