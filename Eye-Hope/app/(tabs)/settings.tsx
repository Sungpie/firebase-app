import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();

  // 샘플 데이터 (실제로는 사용자 설정에서 가져와야 함)
  const selectedCategories = ["인기기사", "복지", "정치", "자립생활", "경제"];
  const currentMorningTime = "오전 9시";
  const currentEveningTime = "오후 8시";

  const handleTimeChange = () => {
    // timeSelect 페이지로 이동하면서 fromSettings 파라미터 전달
    router.push({
      pathname: "/timeSelect" as any,
      params: { fromSettings: "true" },
    });
  };

  const handleCategoryChange = () => {
    // 카테고리 변경 페이지로 이동 (필요시 구현)
    console.log("카테고리 변경");
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
          일상생활 속, eye hope가 알려주는 오늘의 뉴스 기사는 어떠셨나요?
        </Text>
      </View>

      {/* 현재 관심뉴스 섹션 */}
      <View style={styles.interestNewsSection}>
        <Text style={styles.sectionTitle}>현재 관심뉴스</Text>
        <View style={styles.categoriesContainer}>
          {selectedCategories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.questionText}>
          관심뉴스를 수정 / 변경하시겠어요?
        </Text>
        <Pressable onPress={handleCategoryChange}>
          <Text style={styles.instructionText}>
            변경을 원하신다면 두 번 눌러주세요.
          </Text>
        </Pressable>
      </View>

      {/* 시간대 변경 섹션 */}
      <View style={styles.timeChangeSection}>
        <Text style={styles.sectionTitle}>시간 대 변경</Text>
        <View style={styles.timeInfoContainer}>
          <Text style={styles.timeInfoText}>현재 시간 대는</Text>
          <View style={styles.timeButtonsContainer}>
            <View style={styles.timeButton}>
              <Text style={styles.timeButtonText}>{currentMorningTime}</Text>
            </View>
            <Text style={styles.timeInfoText}>와</Text>
            <View style={styles.timeButton}>
              <Text style={styles.timeButtonText}>{currentEveningTime}</Text>
            </View>
            <Text style={styles.timeInfoText}>에요.</Text>
          </View>
        </View>
        <Pressable onPress={handleTimeChange}>
          <Text style={styles.instructionText}>
            시간대 변경을 원하신다면 두 번 눌러주세요.
          </Text>
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
