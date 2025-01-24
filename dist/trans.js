
self.importScripts('ffmpeg.js');

onmessage = function(e) {
  var file = e.data;
  var retrun;
  //console.log(file, typeof(file));
  ffmpeg_run({
    arguments: ['-v', 'panic', '-i', '/input/' + file.name, '-vcodec', 'copy', "-an",'out.ivf'],
    files: [file],
    retrun:retrun
  }, function(results) {
    //console.log(results.outfile, typeof(results));
    var ofile = results.outfile[0];
    var blob = new Blob([ofile.data], {type: "video/mp4"});
    var blobURL = URL.createObjectURL(blob);
    var res = {
      decoderUrl: "inspect.js",
      videoUrl: blobURL, 
      decoderName: file.name,
    };
    self.postMessage(res);
  });
}
