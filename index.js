var rework = require('rework');
var imprt = require('rework-import');
var url = require('rework-plugin-url');
var path = require('path');

var absolute = /^\s*\w+:\/\//;
var css = /\.css$/;
var cssMap = /\.css\.map$/;

var Promise;

function concatCss(indir, outdir, opts) {
  Promise = this.sander.Promise;
  var dest = opts.dest || 'bundle.css';
  var details = {
    indir: indir,
    outdir: outdir,
    opts: opts,
    dest: dest,
    sander: this.sander,
    map: dest + '.map',
    entry: opts.entry,
    sourcemap: opts.sourceMap === false || opts.sourcemap !== false,
    ctx: this,
    root: path.dirname(dest)
      .split('/')
      .filter(function(p) { return p !== '.'; })
      .map(function() { return '..'; })
      .join('/')
  };

  if (details.entry) {
    return concatFrom(details);
  } else {
    return concatAll(details);
  }
}

function concatAll(opts) {
  opts.root = opts.outdir;
  return findFiles(opts).then(function() {
    var str = opts.files
      .map(function(f) { return '@import "' + f + '";'; })
      .join('\n');

    opts.str = str;
    return runConcat(opts);
  });
}

function fixUrls(file, str, opts) {
  var fn = function(u) {
    var res;
    if (absolute.test(u)) res = u;
    else res = path.join(opts.root, path.dirname(file), u);
    if (opts.debug) console.log('replacing', u, 'with', res);
    return res;
  };
  return rework(str).use(url(fn)).toString();
}

function concatFrom(opts) {
  opts.root = path.join(opts.indir, path.dirname(opts.entry));
  return findFiles(opts).then(function() {
    return opts.sander.readFile(opts.indir, opts.entry).then(function(content) {
      opts.str = content.toString();
      return runConcat(opts);
    });
  });
}

function runConcat(opts) {
  // copy all of the files over to start with fixed urls
  return opts.sander.Promise.all(opts.files.map(function(f) {
    return opts.sander.readFile(opts.indir, f).then(function(content) {
      return opts.sander.writeFile(opts.outdir, f, fixUrls(f, content.toString(), opts));
    });
  })).then(function() {
    opts.ctx.log('bundling css...');
    var output = rework(opts.str).use(imprt({ path: opts.root })).toString(opts.sourcemap ? { sourcemap: true, sourcemapAsObject: true } : {});
    output.code += '\n' + '//# sourceMappingURL=' + path.basename(opts.map);

    // delete leftover files from step1
    opts.ctx.log('cleaning up...');
    return Promise.all(opts.files.map(function(f) { return opts.sander.unlink(opts.outdir, f).then(noop, noop); })).then(function() {
      // switch urls back to relative
      output.code = output.code.replace(new RegExp(opts.outdir, 'g'), '.');
      // write out the bundle
      opts.ctx.log('saving bundle...');
      return opts.sander.writeFile(opts.outdir, opts.dest, output.code)
      .then(function() {
        opts.ctx.log('saving source map...');
        return opts.sander.writeFile(opts.outdir, opts.map, JSON.stringify(output.map)).then(function() {
          opts.ctx.log('copying other files...');
          return Promise.all(opts.others.map(function(f) { return opts.sander.link(opts.indir, f).to(opts.outdir, f); }));
        });
      });
    });
  });
}

function noop() {}

function findFiles(opts) {
  opts.ctx.log('finding css files...');
  return opts.sander.lsr(opts.indir).then(function(files) {
    opts.others = files.filter(function(f) { return !css.test(f) && !cssMap.test(f); });
    opts.files = files.filter(function(f) { return css.test(f); });
  });
}

module.exports = concatCss;
