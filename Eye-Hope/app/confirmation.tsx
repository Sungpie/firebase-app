import React from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ConfirmationScreen() {
  const { categories, fromSettings } = useLocalSearchParams<{
    categories: string;
    fromSettings?: string;
  }>();
  const router = useRouter();

  // JSON 문자열을 파싱하여 카테고리 배열로 변환
  const selectedCategories = categories ? JSON.parse(categories) : [];

  const handleGoBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    console.log("최종 확인:", selectedCategories);
    console.log("fromSettings 파라미터:", fromSettings);
    console.log("fromSettings 타입:", typeof fromSettings);

    // fromSettings 파라미터가 있으면 설정 페이지로 돌아가기
    if (fromSettings === "true") {
      console.log("설정 페이지로 돌아가기");
      console.log(
        "전달할 selectedCategories:",
        JSON.stringify(selectedCategories)
      );
      router.push({
        pathname: "/(tabs)/settings",
        params: {
          selectedCategories: JSON.stringify(selectedCategories),
        },
      });
    } else {
      console.log("시간대 선택으로 이동");
      // 일반 플로우라면 timeSelect 화면으로 이동
      router.push({
        pathname: "/timeSelect",
        params: { categories: JSON.stringify(selectedCategories) },
      });
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
          ]}
          onPress={handleConfirm}
          accessibilityLabel="맞아요 버튼"
          accessibilityRole="button"
          accessibilityHint="선택한 카테고리가 맞다면 두 번 탭하세요"
        >
          <Text style={styles.confirmButtonText}>맞아요.</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.modifyButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleGoBack}
          accessibilityLabel="아니에요 수정할래요 버튼"
          accessibilityRole="button"
          accessibilityHint="카테고리를 수정하려면 두 번 탭하세요"
        >
          <Text style={styles.modifyButtonText}>아니에요. 수정할래요.</Text>
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
    backgroundColor: "#276ADC", // 연한 파란색
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
    //transform: [{ rotate: "-45deg" }], // 텍스트를 원래 방향으로
    width: 80, // 텍스트 영역 제한
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
    backgroundColor: "#87CEEB", // 연한 파란색
  },
  modifyButton: {
    backgroundColor: "#87CEEB", // 연한 파란색
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
  modifyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    lineHeight: 28,
  },
});
