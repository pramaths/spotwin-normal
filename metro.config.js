const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Create the default Metro config
const config = getDefaultConfig(__dirname);

// Add the additional extensions for the SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Make sure 'svg' is not included in assetExts
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');

// Add 'svg' to sourceExts
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

// Add additional configurations for TypeScript
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;