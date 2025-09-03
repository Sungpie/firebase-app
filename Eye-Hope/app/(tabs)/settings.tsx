import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 상태 관리
  const [currentCategories, setCurrentCategories] = useState<string[]>([
    "경제",
    "정치",
    "사회",
    "IT",
    "스포츠",
  ]);
  const [currentTimes, setCurrentTimes] = useState<{
    morning: string;
    evening: string;
  }>({
    morning: "오전 9시",
    evening: "오후 8시",
  });

  // 앱 시작 시 저장된 카테고리 로드
  useEffect(() => {
    loadSavedCategories();
  }, []);

  // 화면이 포커스될 때마다 저장된 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      console.log("설정 화면 포커스됨 - 데이터 새로고침");
      console.log("현재 params:", params);
      console.log("params.selectedCategories:", params.selectedCategories);
      console.log("params.selectedTimes:", params.selectedTimes);

      // 파라미터가 있으면 우선 처리 후 즉시 반환
      if (params.selectedCategories || params.selectedTimes) {
        console.log("파라미터가 있어서 파라미터 우선 처리");
        handleParamsUpdate();
        return; // 파라미터 처리 후 즉시 반환
      }

      // 파라미터가 없을 때만 저장된 데이터 로드
      console.log("파라미터가 없어서 저장된 데이터 로드");
      loadSavedCategories();
    }, [params.selectedCategories, params.selectedTimes])
  );

  // 저장된 카테고리와 시간 정보 불러오기
  const loadSavedCategories = async () => {
    try {
      // 카테고리 로드
      const savedCategories = await AsyncStorage.getItem("userCategories");
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        setCurrentCategories(parsedCategories);
        console.log("저장된 카테고리 로드됨:", parsedCategories);
      }

      // 시간 정보 로드
      const savedTimes = await AsyncStorage.getItem("userTimes");
      if (savedTimes) {
        const parsedTimes = JSON.parse(savedTimes);
        setCurrentTimes(parsedTimes);
        console.log("저장된 시간 정보 로드됨:", parsedTimes);
      }
    } catch (error) {
      console.error("저장된 데이터 로드 오류:", error);
    }
  };

  // 파라미터 변경 감지 (useFocusEffect에서 처리하므로 간소화)
  useEffect(() => {
    console.log("파라미터 변경 감지:", params);
    // 실제 처리는 useFocusEffect에서 담당
  }, [params.selectedCategories, params.selectedTimes]);

  // AsyncStorage에 카테고리 저장
  const saveCategoriesToStorage = async (categories: string[]) => {
    try {
      await AsyncStorage.setItem("userCategories", JSON.stringify(categories));
      console.log("카테고리가 저장되었습니다:", categories);
    } catch (error) {
      console.error("카테고리 저장 오류:", error);
    }
  };

  // AsyncStorage에 시간 정보 저장
  const saveTimesToStorage = async (times: {
    morning: string;
    evening: string;
  }) => {
    try {
      await AsyncStorage.setItem("userTimes", JSON.stringify(times));
      console.log("시간 정보가 저장되었습니다:", times);
    } catch (error) {
      console.error("시간 정보 저장 오류:", error);
    }
  };

  // 파라미터 업데이트 처리 함수
  const handleParamsUpdate = () => {
    console.log("파라미터 업데이트 처리 시작");

    // selectedCategories 파라미터가 있으면 업데이트
    if (params.selectedCategories) {
      try {
        const categories = JSON.parse(params.selectedCategories as string);
        console.log("파라미터에서 카테고리 파싱:", categories);
        if (Array.isArray(categories)) {
          console.log("카테고리 상태 업데이트:", categories);
          setCurrentCategories(categories);
          // AsyncStorage에 카테고리 저장
          saveCategoriesToStorage(categories);
        }
      } catch (error) {
        console.error("카테고리 파싱 오류:", error);
      }
    }

    // selectedTimes 파라미터가 있으면 업데이트
    if (params.selectedTimes) {
      try {
        const times = JSON.parse(params.selectedTimes as string);
        if (times.morning && times.evening) {
          const newTimes = {
            morning: times.morning,
            evening: times.evening,
          };
          console.log("시간 상태 업데이트:", newTimes);
          setCurrentTimes(newTimes);
          // AsyncStorage에 시간 정보 저장
          saveTimesToStorage(newTimes);
        }
      } catch (error) {
        console.error("시간 파라미터 파싱 오류:", error);
      }
    }

    console.log("파라미터 업데이트 처리 완료");
  };

  const handleCategoryChange = () => {
    router.push({
      pathname: "/selectCategory",
      params: { fromSettings: "true" },
    });
  };

  const handleTimeChange = () => {
    router.push({
      pathname: "/timeSelect" as any,
      params: { fromSettings: "true" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      {/* 사용자 정보 및 안내 섹션 */}
      <View style={styles.userInfoSection}>
        <Text style={styles.userName}>사용자님</Text>
        <Text style={styles.userQuestion}>
          {"일상생활 속, eye hope이 알려주는\n오늘의 뉴스 기사는 어떠셨나요?"}
        </Text>
      </View>

      {/* 현재 관심뉴스 섹션 */}
      <TouchableOpacity
        style={[styles.interestNewsSection, { alignItems: "center" }]}
        onPress={handleCategoryChange}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="관심 뉴스를 변경하려면 탭하세요"
        accessibilityHint="관심 뉴스 카테고리를 수정할 수 있는 페이지로 이동합니다"
      >
        <Text style={[styles.sectionTitle, { textAlign: "center" }]}>현재 관심뉴스</Text>
        <View style={[styles.categoriesContainer, { justifyContent: "center" }]}>
          {currentCategories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={[styles.categoryText, { textAlign: "center" }]}>{category}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.questionText, { textAlign: "center" }]}>
          관심뉴스를 수정 / 변경하시겠어요?
        </Text>
        <Text style={[styles.instructionText, { textAlign: "center" }]}>
          변경을 원하신다면 두 번 눌러주세요.
        </Text>
      </TouchableOpacity>

      {/* 시간대 변경 섹션 */}
      <TouchableOpacity
        style={[styles.timeChangeSection, { alignItems: "center" }]}
        onPress={handleTimeChange}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="시간대를 변경하려면 탭하세요"
        accessibilityHint="뉴스 알림을 받을 시간대를 수정할 수 있는 페이지로 이동합니다"
      >
        <Text style={[styles.sectionTitle, { textAlign: "center" }]}>시간대 변경</Text>
        <View style={[styles.timeInfoContainer, { alignItems: "center" }]}>
          <Text style={[styles.timeInfoText, { textAlign: "center" }]}>현재 시간대는</Text>
          <View style={[styles.timeButtonsContainer, { alignItems: "center", flexDirection: "row", justifyContent: "center" }]}>
            <View style={styles.timeButton}>
              <Text style={[styles.timeButtonText, { textAlign: "center" }]}>{currentTimes.morning}</Text>
            </View>
            <Text style={[styles.timeInfoText, { textAlign: "center" }]}>와</Text>
            <View style={styles.timeButton}>
              <Text style={[styles.timeButtonText, { textAlign: "center" }]}>{currentTimes.evening}</Text>
            </View>
            <Text style={[styles.timeInfoText, { textAlign: "center" }]}>에요.</Text>
          </View>
        </View>
        <Text style={[styles.instructionText, { textAlign: "center" }]}>
          시간대 변경을 원하신다면 두 번 눌러주세요.
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  userInfoSection: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  userQuestion: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 22,
    textAlign: "center",
  },
  interestNewsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  timeChangeSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  timeInfoContainer: {
    marginBottom: 16,
  },
  timeInfoText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 22,
  },
  timeButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  timeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
