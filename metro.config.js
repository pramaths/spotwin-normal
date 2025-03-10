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

// Add Node.js module polyfills
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  assert: path.resolve(__dirname, 'node_modules/assert'),
  stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
  crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
  http: path.resolve(__dirname, 'node_modules/stream-http'),
  https: path.resolve(__dirname, 'node_modules/https-browserify'),
  os: path.resolve(__dirname, 'node_modules/os-browserify/browser'),
  path: path.resolve(__dirname, 'node_modules/path-browserify'),
  fs: path.resolve(__dirname, 'node_modules/react-native-fs'),
  zlib: path.resolve(__dirname, 'node_modules/browserify-zlib'),
};

// Add additional configurations for TypeScript
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;