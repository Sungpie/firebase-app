import { Redirect } from "expo-router";

export default function Index() {
  // 앱 시작 시 selectCategory 화면으로 자동 리다이렉트
  return <Redirect href="/selectCategory" />;
}
