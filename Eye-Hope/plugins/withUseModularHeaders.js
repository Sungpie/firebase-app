// plugins/withUseModularHeaders.js

const { withPodfile } = require('@expo/config-plugins');

// Podfile의 post_install 훅에 추가할 스크립트 내용
const postInstallScript = `
  installer.pods_project.targets.each do |target|
    if target.name == 'React-RuntimeHermes'
      target.build_configurations.each do |config|
        config.build_settings['DEFINES_MODULE'] = 'NO'
      end
    end
  end
`;

const withCustomPodfileModifications = (config) => {
  return withPodfile(config, (podfileConfig) => {
    // 1. use_modular_headers! 추가 (기존 역할)
    // 이미 추가되어 있는지 확인하여 중복 추가 방지
    if (!podfileConfig.modResults.contents.includes('use_modular_headers!')) {
      podfileConfig.modResults.contents = `use_modular_headers!\n${podfileConfig.modResults.contents}`;
    }

    // 2. post_install 스크립트 추가 (새로운 역할)
    // 이미 post_install 훅이 있는지 확인
    const postInstallHook = 'post_install do |installer|';
    if (podfileConfig.modResults.contents.includes(postInstallHook)) {
      // 훅이 있다면 그 안에 스크립트 삽입
      podfileConfig.modResults.contents = podfileConfig.modResults.contents.replace(
        postInstallHook,
        `${postInstallHook}${postInstallScript}` // 줄바꿈(\n)을 제거하여 더 안정적으로 만듭니다.
      );
    } else {
      // 훅이 없다면 파일 끝에 새로 추가
      podfileConfig.modResults.contents = `${podfileConfig.modResults.contents}\n${postInstallHook}\n${postInstallScript}\nend`;
    }

    return podfileConfig;
  });
};

module.exports = withCustomPodfileModifications;