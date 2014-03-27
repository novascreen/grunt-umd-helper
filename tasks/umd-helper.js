module.exports = function (grunt) {
  var extend = require('util')._extend;
  var _ = require('lodash');

  grunt.registerMultiTask('umdHelperDone', function () {
    var options = this.options(),
      fileContent;

    if (grunt.file.exists(options.destPath)) {
      fileContent = grunt.file.read(options.destPath);
      fileContent = fileContent.replace(options.regex, '');
      grunt.file.write(options.destPath, fileContent);
    }
  });

  grunt.registerMultiTask('umdHelper', function () {
    var options = this.options({
      indent: '  ',
      template: 'node_modules/grunt-umd-helper/templates/umd.hbs'
    });
    var umdTasks = {};
    this.files.forEach(function (file) {
      var srcPath = file.src.toString();
      var destPath = file.dest.toString();

      if (grunt.file.exists(srcPath)) {
        var name = srcPath.replace(/.*\/(.*?)\.js/, '$1');
        var fileContent = grunt.file.read(srcPath);
        var regex = /\/\*\s*umd\s*([\s\S]*?)\s?\*\/[\n\s]*/;
        var match = fileContent.match(regex);
        var umdOptions = {};
        if (match && match.length) {
          umdOptions = JSON.parse(match[1]);
        }
        var umdTask = _.extend({}, options, {
          src: srcPath,
          dest: destPath,
          objectToExport: name,
          amdModuleId: options.namespace ? options.namespace + '/' + name : name,
          deps: {}
        }, umdOptions);

        grunt.log.ok(JSON.stringify(umdTask, null, 2));

        grunt.config('umd.' + name, umdTask);
        grunt.config('umdHelperDone.' + name + '.options', {
          destPath: destPath,
          regex: regex
        });
        grunt.task.run(['umd:' + name, 'umdHelperDone:' + name]);
      }
    });
  });

};