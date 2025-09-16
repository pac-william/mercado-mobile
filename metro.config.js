const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Configuração para react-native-vector-icons
config.resolver.assetExts.push('ttf');

module.exports = withNativeWind(config, { input: './global.css' })