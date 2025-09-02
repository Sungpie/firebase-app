import { Redirect } from "expo-router";

export default function Index() {
  // 앱 시작 시 하단 탭 내비게이터로 자동 리다이렉트
  return <Redirect href="/(tabs)" />;
}
