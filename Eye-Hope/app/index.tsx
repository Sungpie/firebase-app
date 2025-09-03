import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  useEffect(() => {
    checkInitialSetup();
  }, []);

  const checkInitialSetup = async () => {
    try {
      // 저장된 카테고리와 시간 정보 확인
      const savedCategories = await AsyncStorage.getItem("userCategories");
      const savedTimes = await AsyncStorage.getItem("userTimes");
      const setupCompleted = await AsyncStorage.getItem("setupCompleted");

      // 카테고리와 시간이 모두 설정되어 있거나, setupCompleted 플래그가 있으면 설정 완료로 판단
      if ((savedCategories && savedTimes) || setupCompleted === "true") {
        setHasCompletedSetup(true);
      }
    } catch (error) {
      console.error("초기 설정 확인 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때 스플래시 화면 표시
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 설정 완료 여부에 따라 적절한 화면으로 리다이렉트
  if (hasCompletedSetup) {
    // 설정이 완료되었으면 바로 관심뉴스 탭으로 이동
    return <Redirect href="/(tabs)" />;
  } else {
    // 설정이 완료되지 않았으면 카테고리 선택 화면으로 이동
    return <Redirect href="/selectCategory" />;
  }
}