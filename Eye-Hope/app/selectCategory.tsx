import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SelectCategoryScreen() {
  // 다중 선택을 위한 상태: string[] 배열
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fromSettings } = useLocalSearchParams<{ fromSettings?: string }>();

  const categories = [
    "경제",
    "증권",
    "스포츠",
    "연예",
    "정치",
    "IT",
    "사회",
    "오피니언",
  ];

  // 카테고리 선택/해제 및 최대 5개 제한
  const handleCategorySelect = (category: string) => {
    if (selectedCategories.includes(category)) {
      // 이미 선택된 경우 해제
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length < 5) {
        setSelectedCategories([...selectedCategories, category]);
      } else {
        // 5개 초과 선택 방지
        alert("최대 5개까지 선택할 수 있어요!");
      }
    }
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    router.back();
  };

  // 완료 버튼 클릭 시, 선택된 카테고리 배열을 쿼리 파라미터로 전달
  const handleComplete = () => {
    if (selectedCategories.length > 0) {
      console.log("선택된 카테고리:", selectedCategories);
      console.log("fromSettings 파라미터:", fromSettings);
      console.log("fromSettings 타입:", typeof fromSettings);

      router.push({
        pathname: "/confirmation",
        params: {
          categories: JSON.stringify(selectedCategories),
          fromSettings: fromSettings || undefined,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 - 설정 페이지에서 온 경우에만 표시 */}
      {fromSettings === "true" && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 20) }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>관심분야 선택</Text>
          <View style={styles.placeholder} />
        </View>
      )}

      {/* 상단 안내 문구 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          관심 분야 선택을 진행하겠습니다.
        </Text>
        <Text style={styles.instructionText}>
          총 12개의 분야 중, 원하는 뉴스 기사 분야를{'\n'}
          최대 5개까지 선택해주세요.
        </Text>
      </View>

      {/* 중간 버튼 그리드 */}
      <ScrollView
        style={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        <View style={styles.gridWrapper}>
          {categories.map((item) => {
            const isSelected = selectedCategories.includes(item);
            return (
              <Pressable
                key={item}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategoryButton,
                ]}
                onPress={() => handleCategorySelect(item)}
                onPressIn={() => console.log("터치 시작:", item)}
                accessibilityLabel={`${item} 카테고리`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityHint="이 카테고리를 선택하려면 두 번 탭하세요"
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    isSelected && styles.selectedCategoryButtonText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 완료 버튼 - 카테고리 그리드 바로 밑에 위치 */}
        <View style={styles.completeButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.completeButton,
              selectedCategories.length === 0 && styles.disabledCompleteButton,
              pressed && styles.pressedButton,
            ]}
            onPress={handleComplete}
            disabled={selectedCategories.length === 0}
            onPressIn={() => console.log("완료 버튼 터치됨")}
            accessibilityLabel="선택 완료 버튼"
            accessibilityRole="button"
            accessibilityState={{ disabled: selectedCategories.length === 0 }}
            accessibilityHint={
              selectedCategories.length > 0
                ? "선택한 카테고리로 진행하려면 두 번 탭하세요"
                : "카테고리를 먼저 선택해주세요"
            }
          >
            <Text
              style={[
                styles.completeButtonText,
                selectedCategories.length === 0 &&
                  styles.disabledCompleteButtonText,
              ]}
            >
              완료
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  instructionContainer: {
    marginHorizontal: 20,
    marginTop: 70,
    marginBottom: 30,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000000",
    lineHeight: 24,
    marginBottom: 4,
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  gridContent: {
    paddingBottom: 20,
  },
  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryButton: {
    width: "48%",
    height: 60,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    marginBottom: 12,
    minHeight: 60,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedCategoryButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    elevation: 4,
    shadowOpacity: 0.3,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    textAlign: "center",
  },
  selectedCategoryButtonText: {
    color: "#FFFFFF",
  },
  completeButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  completeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    minWidth: 120,
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
  disabledCompleteButton: {
    backgroundColor: "#CCCCCC",
    elevation: 0,
    shadowOpacity: 0,
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledCompleteButtonText: {
    color: "#999999",
  },
});
