self.importScripts('ffprobe.js');


onmessage = function(e) {
  var file = e.data;
  var name = file.name;
  ffprobe_run({
    //arguments: ['-select_streams', 'v', '-show_entries', 'frame=pts_time,pict_type : stream=index,codec_type', '-of', 'csv', '/input/' + file.name],
    arguments: ['-v', 'error', '-select_streams', 'v', '-show_entries', 'packet=dts_time,flags : stream=index,codec_type', '-of', 'csv', '/input/' + file.name],
    files: [file],
    noExitRuntime: true,
    onExit: function () { console.log("on exit"); },
    postRun: function () { console.log("post Run"); }
  }, function (results) {
      //console.log(results);
      self.postMessage( {name: name, results:results});
  });
}
