import { Redirect } from "expo-router";

export default function Index() {
  // 앱 시작 시 관심분야 선택 페이지로 이동
  return <Redirect href="/selectCategory" />;
}
