module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {  // ✅ added dotenv plugin
      moduleName: '@env',
      path: '.env',
    }],
    'react-native-reanimated/plugin', // ✅ keep reanimated after dotenv
    'nativewind/babel',                // ✅ keep nativewind
  ],
};
