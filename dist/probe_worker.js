self.importScripts('ffprobe.js');


onmessage = function (e) {
  var data = e.data;
  var file = data.file;
  var name = file.name;

  var args = ['-v', 'error'];
  if (data.stream) {
    args.push('-select_streams', data.stream);
  }
  //'packet=dts_time,size,flags : stream=index,codec_type',
  if (data.entries) {
    args.push('-show_entries', data.entries);
  }
  args.push('-of', 'csv', '/input/' + file.name);

  ffprobe_run({
    arguments: args,
    files: [file],
    noExitRuntime: true,
    onExit: function () { console.log("on exit"); },
    postRun: function () { console.log("post Run"); }
  }, function (results) {
    //console.log(results);
    self.postMessage({ name: name, results: results });
  });
}
