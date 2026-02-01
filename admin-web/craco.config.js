const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add alias for services
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@services': path.resolve(__dirname, 'src/services'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
      };
      
      return webpackConfig;
    },
  },
};