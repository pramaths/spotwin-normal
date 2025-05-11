const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (moduleName.startsWith('@privy-io/')) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: true,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

// Modify the config
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'mjs', 'cjs'];
config.resolver.resolveRequest = resolveRequestWithPackageExports;

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