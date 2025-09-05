import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  // DeviceId 생성 또는 가져오기
  const getOrCreateDeviceId = async (): Promise<string> => {
    try {
      let storedDeviceId = await AsyncStorage.getItem("deviceId");
      if (!storedDeviceId) {
        storedDeviceId = uuid.v4() as string;
        await AsyncStorage.setItem("deviceId", storedDeviceId);
        console.log("새로운 DeviceId 생성:", storedDeviceId);
      } else {
        console.log("기존 DeviceId 사용:", storedDeviceId);
      }
      return storedDeviceId;
    } catch (error) {
      console.error("DeviceId 생성/조회 오류:", error);
      const newDeviceId = uuid.v4() as string;
      return newDeviceId;
    }
  };

  // 백엔드에서 사용자 정보 확인
  const checkUserExistsInBackend = async (deviceId: string): Promise<boolean> => {
    try {
      console.log("백엔드에서 사용자 정보 확인 중:", deviceId);
      
      // 타임아웃을 위한 Promise.race 사용
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API 호출 타임아웃 (10초)')), 10000);
      });
      
      const fetchPromise = fetch(`http://13.124.111.205:8080/api/users/${encodeURIComponent(deviceId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // 타임아웃과 API 호출을 경쟁시킴
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      console.log("사용자 정보 조회 응답 상태:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("사용자 정보 조회 응답:", result);
        
        if (result.success && result.data) {
          // 사용자 정보를 AsyncStorage에 저장
          await AsyncStorage.setItem("userInfo", JSON.stringify(result.data));
          console.log("백엔드에서 사용자 정보를 찾았습니다:", result.data);
          return true;
        }
      }
      
      // 404나 사용자를 찾지 못한 경우
      if (response.status === 404) {
        console.log("백엔드에서 사용자를 찾을 수 없습니다 (404)");
        // 로컬 데이터 정리
        await AsyncStorage.multiRemove([
          "setupCompleted",
          "userCategories", 
          "userTimes",
          "userInfo"
        ]);
        console.log("로컬 데이터 정리 완료");
        return false;
      }
      
      console.log("백엔드에서 사용자 정보를 찾을 수 없습니다");
      return false;
    } catch (error) {
      console.error("백엔드 사용자 확인 오류:", error);
      
      // 타임아웃이나 네트워크 오류 시 로컬 데이터 정리
      if (error instanceof Error && 
          (error.message.includes('타임아웃') || 
           error.message.includes('Network request failed'))) {
        console.log("네트워크 오류로 인한 로컬 데이터 정리");
        await AsyncStorage.multiRemove([
          "setupCompleted",
          "userCategories", 
          "userTimes",
          "userInfo"
        ]);
      }
      
      return false;
    }
  };

  const checkUserStatus = async () => {
    try {
      console.log("사용자 상태 확인 시작");
      
      // DeviceId 생성 또는 가져오기
      const currentDeviceId = await getOrCreateDeviceId();
      setDeviceId(currentDeviceId);

      // 로컬 설정 완료 플래그 확인
      const setupCompleted = await AsyncStorage.getItem("setupCompleted");
      console.log("로컬 설정 완료 플래그:", setupCompleted);

      // 백엔드에서 사용자 정보 확인
      const userExistsInBackend = await checkUserExistsInBackend(currentDeviceId);
      
      // 설정이 완료되었고 백엔드에 사용자 정보가 있으면 설정 완료로 판단
      if (setupCompleted === "true" && userExistsInBackend) {
        console.log("설정 완료된 사용자 - 관심뉴스 탭으로 이동");
        setHasCompletedSetup(true);
      } else {
        console.log("신규 사용자 또는 설정 미완료 - 카테고리 선택으로 이동");
        setHasCompletedSetup(false);
        
        // 설정이 완료되지 않은 경우 관련 데이터 정리
        if (setupCompleted !== "true") {
          await AsyncStorage.multiRemove([
            "userCategories",
            "userTimes",
            "userInfo"
          ]);
          console.log("설정 관련 데이터 정리 완료");
        }
      }
    } catch (error) {
      console.error("사용자 상태 확인 오류:", error);
      // 오류 발생 시 신규 사용자로 처리
      setHasCompletedSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때 스플래시 화면 표시
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#FFFFFF" 
      }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: "#8E8E93",
          textAlign: "center" 
        }}>
          사용자 정보를 확인하는 중...
        </Text>
        {deviceId && (
          <Text style={{ 
            marginTop: 8, 
            fontSize: 12, 
            color: "#C7C7CC",
            textAlign: "center" 
          }}>
            Device ID: {deviceId.substring(0, 8)}...
          </Text>
        )}
      </View>
    );
  }

  // 설정 완료 여부에 따라 적절한 화면으로 리다이렉트
  if (hasCompletedSetup) {
    // 설정이 완료되었으면 바로 관심뉴스 탭으로 이동
    console.log("기존 사용자 - 관심뉴스 탭으로 리다이렉트");
    return <Redirect href="/(tabs)" />;
  } else {
    // 설정이 완료되지 않았으면 카테고리 선택 화면으로 이동
    console.log("신규 사용자 - 카테고리 선택으로 리다이렉트");
    return <Redirect href="/selectCategory" />;
  }
}