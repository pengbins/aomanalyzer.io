/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 352);
/******/ })
/************************************************************************/
/******/ ({

/***/ 352:
/***/ (function(module, exports) {

// declare var TextDecoder;
function assert(c, message) {
    if (message === void 0) { message = ""; }
    if (!c) {
        throw new Error(message);
    }
}
var decoderPathPrefix = "";
onmessage = function (e) {
    // console.log("Worker: " + e.data.command);
    switch (e.data.command) {
        case "load":
            try {
                var payload = e.data.payload;
                var path = payload[0];
                decoderPathPrefix = path.substring(0, path.lastIndexOf("/") + 1);
                importScripts.apply(self, payload);
                load(payload[0], function (nativeModule) {
                    native = nativeModule;
                    // TODO: Remove after a while. For backwards compatibility, older
                    // analyzer files may not have compression.
                    native._set_compress && native._set_compress(1);
                    var buildConfig;
                    if (native._get_aom_codec_build_config) {
                        // TODO: Remove after a while, make sure libaom is updated to use |_get_codec_build_config|.
                        buildConfig = native.UTF8ToString(native._get_aom_codec_build_config());
                    }
                    else if (native._get_codec_build_config) {
                        buildConfig = native.UTF8ToString(native._get_codec_build_config());
                    }
                    else {
                        buildConfig = "N/A";
                    }
                    postMessage({
                        command: "loadResult",
                        payload: {
                            buildConfig: buildConfig
                        },
                        id: e.data.id
                    }, undefined);
                });
            }
            catch (x) {
                postMessage({
                    command: "loadResult",
                    payload: false,
                    id: e.data.id
                }, undefined);
            }
            break;
        case "readFrame":
            readFrame(e);
            break;
        case "setLayers":
            setLayers(e);
            break;
        case "openFileBytes":
            openFileBytes(e.data.payload);
            break;
        case "releaseFrameBuffers":
            releaseFrameBuffer(e.data.payload.Y);
            releaseFrameBuffer(e.data.payload.U);
            releaseFrameBuffer(e.data.payload.V);
            break;
    }
};
var native = null;
var frameRate = 0;
var buffer = null;
var json = null;
function load(path, ready) {
    var Module = {
        locateFile: function (path) {
            return decoderPathPrefix + path;
        },
        noExitRuntime: true,
        noInitialRun: true,
        preRun: [],
        postRun: [function () {
                // console.info(`Loaded Decoder in Worker`);
            }],
        memoryInitializerPrefixURL: "bin/",
        arguments: ['input.ivf', 'output.raw'],
        on_frame_decoded_json: function (p) {
            var s = "";
            if (typeof TextDecoder != "undefined") {
                var m = Module.HEAP8;
                var e = p;
                while (m[e] != 0) {
                    e++;
                }
                var textDecoder = new TextDecoder("utf-8");
                s = textDecoder.decode(m.subarray(p, e));
            }
            else {
                s = Module.UTF8ToString(p);
            }
            json = JSON.parse("[" + s + "null]");
        },
        onRuntimeInitialized: function () {
            ready(Module);
        }
    };
    DecoderModule(Module);
}
function openFileBytes(buffer) {
    frameRate = buffer[16] | buffer[17] << 24 | buffer[18] << 16 | buffer[19] << 24;
    buffer = buffer;
    native.FS.writeFile("/tmp/input.ivf", buffer, { encoding: "binary" });
    native._open_file();
}
var bufferPool = [];
function releaseFrameBuffer(buffer) {
    if (bufferPool.length < 64) {
        bufferPool.push(buffer);
    }
}
function getReleasedBuffer(byteLength) {
    var i;
    for (i = 0; i < bufferPool.length; i++) {
        if (bufferPool[i].byteLength === byteLength) {
            return bufferPool.splice(i, 1)[0];
        }
    }
    return null;
}
var AOM_IMG_FMT_PLANAR = 0x100;
var AOM_IMG_FMT_HIGHBITDEPTH = 0x800;
var AOM_IMG_FMT_I444 = AOM_IMG_FMT_PLANAR | 6;
var AOM_IMG_FMT_I44416 = AOM_IMG_FMT_I444 | AOM_IMG_FMT_HIGHBITDEPTH;
function getImageFormat() {
    // TODO: Just call |native._get_image_format| directly. Older analyzer builds may not have
    // this function so need this for backwards compatibility.
    return native._get_image_format ? native._get_image_format() : AOM_IMG_FMT_PLANAR;
}
function readPlane(plane) {
    var p = native._get_plane(plane);
    var HEAPU8 = native.HEAPU8;
    var stride = native._get_plane_stride(plane);
    var depth = native._get_bit_depth();
    var width = native._get_frame_width();
    var height = native._get_frame_height();
    var fmt = getImageFormat();
    var hbd = fmt & AOM_IMG_FMT_HIGHBITDEPTH;
    if (hbd) {
        stride >>= 1;
    }
    var xdec;
    var ydec;
    if (fmt == AOM_IMG_FMT_I444 || fmt == AOM_IMG_FMT_I44416) {
        xdec = 0;
        ydec = 0;
    }
    else {
        xdec = plane > 0 ? 1 : 0;
        ydec = plane > 0 ? 1 : 0;
    }
    width >>= xdec;
    height >>= ydec;
    var byteLength = height * width;
    var buffer = getReleasedBuffer(byteLength);
    if (buffer && !hbd) {
        // Copy into released buffer.
        var tmp = new Uint8Array(buffer);
        if (stride === width) {
            tmp.set(HEAPU8.subarray(p, p + byteLength));
        }
        else {
            for (var i = 0; i < height; i++) {
                tmp.set(HEAPU8.subarray(p, p + width), i * width);
                p += stride;
            }
        }
    }
    else if (hbd) {
        var tmpBuffer = buffer ? new Uint8Array(buffer) : new Uint8Array(byteLength);
        if (depth == 10) {
            // Convert to 8 bit depth.
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var offset = y * (stride << 1) + (x << 1);
                    tmpBuffer[y * width + x] = (HEAPU8[p + offset] + (HEAPU8[p + offset + 1] << 8)) >> 2;
                }
            }
        }
        else {
            // Unpack to 8 bit depth.
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var offset = y * (stride << 1) + (x << 1);
                    tmpBuffer[y * width + x] = HEAPU8[p + offset];
                }
            }
        }
        buffer = tmpBuffer.buffer;
        depth = 8;
    }
    else {
        if (stride === width) {
            buffer = HEAPU8.slice(p, p + byteLength).buffer;
        }
        else {
            var tmp = new Uint8Array(byteLength);
            for (var i = 0; i < height; i++) {
                tmp.set(HEAPU8.subarray(p, p + width), i * width);
                p += stride;
            }
            buffer = tmp.buffer;
        }
    }
    return {
        buffer: buffer,
        stride: width,
        depth: depth,
        width: width,
        height: height,
        xdec: xdec,
        ydec: ydec
    };
}
function readImage() {
    return {
        hashCode: Math.random() * 1000000 | 0,
        Y: readPlane(0),
        U: readPlane(1),
        V: readPlane(2)
    };
}
function readFrame(e) {
    var s = performance.now();
    if (native._read_frame() != 0) {
        postMessage({
            command: "readFrameResult",
            payload: { json: null, decodeTime: performance.now() - s },
            id: e.data.id
        }, undefined);
        return null;
    }
    var image = null;
    if (e.data.shouldReadImageData) {
        image = readImage();
    }
    self.postMessage({
        command: "readFrameResult",
        payload: { json: json, image: image, decodeTime: performance.now() - s },
        id: e.data.id
    }, image ? [
        image.Y.buffer,
        image.U.buffer,
        image.V.buffer
    ] : undefined);
    assert(image.Y.buffer.byteLength === 0 &&
        image.U.buffer.byteLength === 0 &&
        image.V.buffer.byteLength === 0, "Buffers must be transferred.");
}
function setLayers(e) {
    native._set_layers(e.data.payload);
}


/***/ })

/******/ });