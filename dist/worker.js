
self.importScripts('ffmpeg.js');

onmessage = function(e) {
  var files = e.data;
  var retrun;
  console.log(files);
  ffmpeg_run({
    arguments: ['-v', 'debug','-i', '/input/' + files[0].name, '-vcodec', 'copy', 'out.mp4'],
    files: files,
    retrun:retrun
  }, function(results) {
    var blob = new Blob([results[0].data], {type: "video/mp4"});
    var blobURL = URL.createObjectURL(blob);
    self.postMessage(blobURL);
  });

}

