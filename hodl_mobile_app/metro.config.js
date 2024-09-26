const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver } = config;

  config.resolver = {
    ...resolver,
    extraNodeModules: {
      ...resolver.extraNodeModules,
      crypto: require.resolve('expo-crypto'),
    },
  };

  return config;
})();