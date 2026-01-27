
self.importScripts('ffmpeg.js');

onmessage = function(e) {
  var files = e.data;
  var retrun;
  console.log(files, typeof(files));
  ffmpeg_run({
    arguments: ['-v', 'debug',   '-i', '/input/' + files[0].name, '-vsync', '0', '-vcodec', 'copy', "-an",'out.mp4'],
    files: files,
    retrun:retrun
  }, function(results) {
    var ofile = results.outfile[0];
    var blob = new Blob([ofile.data], {type: "video/mp4"});
    var blobURL = URL.createObjectURL(blob);
    self.postMessage(blobURL);
  });
}
