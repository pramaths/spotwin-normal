const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Modify the config
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'mjs', 'cjs'];

// Add TypeScript extensions explicitly
if (!config.resolver.sourceExts.includes('ts')) {
  config.resolver.sourceExts.push('ts');
}
if (!config.resolver.sourceExts.includes('tsx')) {
  config.resolver.sourceExts.push('tsx');
}

// Exclude fsevents from being watched
config.resolver.blockList = [/node_modules\/fsevents\/.*/];
config.watchFolders = config.watchFolders || [];

// Add @coral-xyz/anchor to watch folders
config.watchFolders.push(path.resolve(__dirname, 'node_modules/@coral-xyz/anchor'));

// Add structuredClone polyfill
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  console.log("structuredClone polyfill added");
}

// Add Buffer polyfill
global.Buffer = global.Buffer || require('buffer').Buffer;

// Fix Buffer.prototype.readUIntLE
if (global.Buffer && !global.Buffer.prototype.readUIntLE) {
  global.Buffer.prototype.readUIntLE = function(offset, byteLength) {
    let val = 0;
    let mul = 1;
    for (let i = 0; i < byteLength; i++) {
      val += this[offset + i] * mul;
      mul *= 256;
    }
    return val;
  };
  console.log("Buffer.readUIntLE polyfill added");
}

// Add Node.js module polyfills
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: path.resolve(__dirname, 'node_modules/buffer'),
  assert: path.resolve(__dirname, 'node_modules/assert'),
  stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
  crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
  http: path.resolve(__dirname, 'node_modules/stream-http'),
  https: path.resolve(__dirname, 'node_modules/https-browserify'),
  os: path.resolve(__dirname, 'node_modules/os-browserify/browser'),
  path: path.resolve(__dirname, 'node_modules/path-browserify'),
  fs: path.resolve(__dirname, 'node_modules/react-native-fs'),
  zlib: path.resolve(__dirname, 'node_modules/browserify-zlib'),
  url: path.resolve(__dirname, 'node_modules/url'),
};

// Add additional configurations for TypeScript
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;