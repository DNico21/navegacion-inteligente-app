// app.config.js — extiende app.json inyectando variables de entorno sensibles
// Las keys NUNCA van en app.json (que sí se sube al repo)

const { expo } = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...expo.ios,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    },
  },
  android: {
    ...expo.android,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
});
