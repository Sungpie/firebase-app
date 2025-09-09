// plugins/withUseModularHeaders.js

const { withPodfile } = require('@expo/config-plugins');

const withUseModularHeaders = (config) => {
  return withPodfile(config, (podfileConfig) => {
    // Podfile 내용의 맨 위에 'use_modular_headers!'를 추가합니다.
    podfileConfig.modResults.contents = `use_modular_headers!\n${podfileConfig.modResults.contents}`;
    return podfileConfig;
  });
};

module.exports = withUseModularHeaders;