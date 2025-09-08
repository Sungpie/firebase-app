import React from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

// 카테고리 매핑 함수들
const categoryToId = (category: string): number => {
  const mapping: { [key: string]: number } = {
    "경제": 1,
    "증권": 2,
    "스포츠": 3,
    "연예": 4,
    "정치": 5,
    "IT": 6,
    "사회": 7,
    "오피니언": 8,
  };
  return mapping[category] || 0;
};

const idToCategory = (id: number): string => {
  const mapping: { [key: number]: string } = {
    1: "경제",
    2: "증권", 
    3: "스포츠",
    4: "연예",
    5: "정치",
    6: "IT",
    7: "사회",
    8: "오피니언",
  };
  return mapping[id] || "";
};

interface UserNewsData {
  deviceId: string;
  newsIds: number[];
}

interface UserRegistrationData {
  deviceId: string;
  name?: string;
  email?: string;
  nickname: string;
  password?: string;
}

export default function ConfirmationScreen() {
  const { categories, fromSettings } = useLocalSearchParams<{
    categories: string;
    fromSettings?: string;
  }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // JSON 문자열을 파싱하여 카테고리 배열로 변환
  const selectedCategories = categories ? JSON.parse(categories) : [];

  // 사용자 존재 여부 확인
  const checkUserExists = async (deviceId: string): Promise<boolean> => {
    try {
      console.log("👤 사용자 존재 여부 확인 중:", deviceId);
      
      const response = await fetch(`http://13.124.111.205:8080/api/users/${encodeURIComponent(deviceId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("👤 사용자 존재 확인 응답 상태:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("👤 사용자 존재 확인 응답:", result);
        return result.success && result.data;
      }
      
      return false;
    } catch (error) {
      console.error("👤 사용자 존재 확인 오류:", error);
      return false;
    }
  };

  // 사용자 등록 API 호출
  const registerUser = async (userData: UserRegistrationData) => {
    try {
      console.log("👤 === 사용자 등록 API 호출 시작 ===");
      console.log("📤 전송 데이터:", JSON.stringify(userData, null, 2));
      
      const response = await fetch("http://13.124.111.205:8080/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: userData.deviceId,
          name: userData.name || null,
          email: userData.email || null,
          nickname: userData.nickname,
          password: null,
        }),
      });

      const result = await response.json();
      console.log("👤 사용자 등록 응답:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "사용자 등록에 실패했습니다.");
      }

      return result;
    } catch (error) {
      console.error("👤 사용자 등록 오류:", error);
      throw error;
    }
  };

  // 백엔드에 사용자 관심 뉴스 저장
  const saveUserNews = async (newsData: UserNewsData) => {
    try {
      console.log("📰 === 사용자 관심 뉴스 저장 API 호출 시작 ===");
      console.log("📤 전송 데이터:", JSON.stringify(newsData, null, 2));
      
      const response = await fetch("http://13.124.111.205:8080/api/users/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      });

      console.log("📥 응답 상태:", response.status);
      
      const result = await response.json();
      console.log("📥 응답 데이터:", JSON.stringify(result, null, 2));
      console.log("📰 === 사용자 관심 뉴스 저장 API 호출 종료 ===");

      if (!response.ok || !result.success) {
        throw new Error(result.message || "관심 뉴스 저장에 실패했습니다.");
      }

      return result;
    } catch (error) {
      console.error("🚨 관심 뉴스 저장 오류:", error);
      throw error;
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleConfirm = async () => {
    console.log("=== 카테고리 확인 완료 ===");
    console.log("선택된 카테고리:", selectedCategories);
    console.log("fromSettings 파라미터:", fromSettings);

    setLoading(true);

    try {
      // DeviceId 가져오기
      const deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      console.log("🔍 DeviceId:", deviceId);

      // 사용자 존재 여부 확인
      const userExists = await checkUserExists(deviceId);
      console.log("👤 사용자 존재 여부:", userExists);

      // 사용자가 존재하지 않으면 먼저 등록
      if (!userExists) {
        console.log("⚠️ 사용자가 존재하지 않음 - 먼저 사용자 등록 진행");
        
        // 로컬 스토리지에서 사용자 정보 확인
        let userInfo = null;
        const savedUserInfo = await AsyncStorage.getItem("userInfo");
        if (savedUserInfo) {
          try {
            userInfo = JSON.parse(savedUserInfo);
          } catch (parseError) {
            console.error("사용자 정보 파싱 오류:", parseError);
          }
        }

        // 사용자 정보가 없으면 기본 닉네임으로 등록
        const nickname = userInfo?.nickname || "사용자";
        
        const userRegistrationData: UserRegistrationData = {
          deviceId: deviceId,
          name: undefined,
          email: undefined,
          nickname: nickname,
          password: undefined,
        };

        try {
          await registerUser(userRegistrationData);
          console.log("✅ 사용자 등록 성공");

          // 사용자 정보를 AsyncStorage에 저장
          await AsyncStorage.setItem("userInfo", JSON.stringify({
            deviceId: deviceId,
            name: "",
            email: "",
            nickname: nickname,
          }));

        } catch (registerError) {
          console.error("❌ 사용자 등록 실패:", registerError);
          
          Alert.alert(
            "사용자 등록 실패",
            "사용자 등록에 실패했습니다. 처음부터 다시 시작하시겠습니까?",
            [
              {
                text: "취소",
                style: "cancel",
              },
              {
                text: "다시 시작",
                onPress: () => {
                  // 로컬 데이터 모두 삭제 후 처음부터
                  AsyncStorage.multiRemove([
                    "setupCompleted", 
                    "userCategories", 
                    "userTimes", 
                    "userInfo",
                    "deviceId"
                  ]).then(() => {
                    router.replace("/selectCategory");
                  });
                },
              },
            ]
          );
          return;
        }
      }

      // 카테고리를 ID로 변환
      const newsIds = selectedCategories.map((category: string) => categoryToId(category));
      console.log("변환된 뉴스 ID:", newsIds);

      // 백엔드에 관심 뉴스 저장
      const userNewsData: UserNewsData = {
        deviceId: deviceId,
        newsIds: newsIds,
      };

      await saveUserNews(userNewsData);
      console.log("✅ 관심 뉴스가 백엔드에 저장되었습니다");

      // 로컬스토리지에도 저장 (캐시용)
      await AsyncStorage.setItem("userCategories", JSON.stringify(selectedCategories));
      console.log("✅ 관심 뉴스가 로컬에도 저장되었습니다");

      // fromSettings 파라미터 확인
      if (fromSettings === "true") {
        console.log("설정 페이지로 돌아가기");
        router.push({
          pathname: "/(tabs)/settings",
          params: {
            selectedCategories: JSON.stringify(selectedCategories),
            fromNewsUpdate: "true",
          },
        });
      } else {
        console.log("사용자 등록으로 이동");
        // 일반 플로우라면 바로 사용자 등록 화면으로 이동 (알림 시간은 빈 배열로 전송)
        router.push({
          pathname: "/userRegistration",
          params: { 
            categories: JSON.stringify(selectedCategories),
            selectedTimes: JSON.stringify({ morning: "", evening: "" })
          },
        });
      }

    } catch (error) {
      console.error("❌ 관심 뉴스 저장 오류:", error);
      
      const errorMessage = error instanceof Error ? error.message : "관심 뉴스 저장 중 오류가 발생했습니다.";
      
      Alert.alert(
        "오류",
        errorMessage,
        [
          {
            text: "그래도 진행",
            onPress: () => {
              // 오류가 발생해도 로컬에만 저장하고 진행
              AsyncStorage.setItem("userCategories", JSON.stringify(selectedCategories));
              
              if (fromSettings === "true") {
                router.push({
                  pathname: "/(tabs)/settings",
                  params: {
                    selectedCategories: JSON.stringify(selectedCategories),
                  },
                });
              } else {
                router.push({
                  pathname: "/userRegistration",
                  params: { 
                    categories: JSON.stringify(selectedCategories),
                    selectedTimes: JSON.stringify({ morning: "", evening: "" })
                  },
                });
              }
            },
          },
          {
            text: "처음부터 다시",
            onPress: () => {
              // 로컬 데이터 모두 삭제 후 처음부터
              AsyncStorage.multiRemove([
                "setupCompleted", 
                "userCategories", 
                "userTimes", 
                "userInfo",
                "deviceId"
              ]).then(() => {
                router.replace("/selectCategory");
              });
            },
          },
          {
            text: "재시도",
            style: "cancel",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 안내 문구 박스 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          선택하신 뉴스 기사를 확인할게요.
        </Text>
      </View>

      {/* 중간 카테고리 목록 */}
      <View style={styles.categoriesContainer}>
        {selectedCategories.map((category: string, index: number) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.diamondIcon}>
              <Text style={styles.diamondText}>{category}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 하단 요약 박스 */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          총 {selectedCategories.length}가지 관심 뉴스를 선택하셨어요.
        </Text>
        <Text style={styles.summaryText}>
          관심 분야는 언제든지 바꿀 수 있어요.
        </Text>
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.confirmButton,
            pressed && styles.pressedButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={loading}
          accessibilityLabel="맞아요 버튼"
          accessibilityRole="button"
          accessibilityHint="선택한 카테고리가 맞다면 두 번 탭하세요"
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={[styles.confirmButtonText, loading && styles.disabledButtonText]}>
              맞아요
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.modifyButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleGoBack}
          disabled={loading}
          accessibilityLabel="아니에요 수정할래요 버튼"
          accessibilityRole="button"
          accessibilityHint="카테고리를 수정하려면 두 번 탭하세요"
        >
          <Text style={styles.modifyButtonText}>아니에요 수정할래요</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  instructionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000000",
    lineHeight: 24,
  },
  categoriesContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  categoryItem: {
    marginBottom: 16,
  },
  diamondIcon: {
    width: 120,
    height: 60,
    backgroundColor: "#276ADC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  diamondText: {
    fontSize: 24,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    width: 80,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  summaryText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000000",
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButton: {
    backgroundColor: "#87CEEB",
  },
  modifyButton: {
    backgroundColor: "#87CEEB",
  },
  disabledButton: {
    backgroundColor: "#C7C7CC",
    elevation: 0,
    shadowOpacity: 0,
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  disabledButtonText: {
    color: "#8E8E93",
  },
  modifyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    lineHeight: 28,
  },
});