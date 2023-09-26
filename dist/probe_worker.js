self.importScripts('ffprobe.js');


onmessage = function(e) {
  var data = e.data;
  var file = data.file;
  var name = file.name;
  var stream = data.stream;
  ffprobe_run({
    arguments: ['-v', 'error', '-select_streams', stream, '-show_entries', 'packet=dts_time,size,flags : stream=index,codec_type', '-of', 'csv', '/input/' + file.name],
    files: [file],
    noExitRuntime: true,
    onExit: function () { console.log("on exit"); },
    postRun: function () { console.log("post Run"); }
  }, function (results) {
      //console.log(results);
      self.postMessage( {name: name, results:results});
  });
}
