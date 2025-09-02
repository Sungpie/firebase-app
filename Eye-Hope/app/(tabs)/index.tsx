import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function CategorySelectionScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    "인기기사",
    "정보세상",
    "인권",
    "노동",
    "교육",
    "복지",
    "자립생활",
    "정치",
    "증권",
    "경제",
    "사회",
    "문화",
  ];

  const handleCategorySelect = (category: string) => {
    console.log("터치됨:", category); // 디버깅용 로그
    setSelectedCategory(category);
  };

  const handleComplete = () => {
    if (selectedCategory) {
      console.log("선택된 카테고리:", selectedCategory);
      // 여기에 완료 처리 로직을 추가할 수 있습니다
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 안내 문구 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          관심 분야를 선택을 진행하겠습니다.
        </Text>
        <Text style={styles.instructionText}>
          총 12개의 분야 중, 원하는 뉴스 기사 분야를 선택해주세요.
        </Text>
      </View>

      {/* 중간 버튼 그리드 */}
      <ScrollView
        style={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        <View style={styles.gridWrapper}>
          {categories.map((item, index) => {
            const isSelected = selectedCategory === item;
            return (
              <Pressable
                key={item}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategoryButton,
                ]}
                onPress={() => handleCategorySelect(item)}
                onPressIn={() => console.log("터치 시작:", item)} // 디버깅용
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
      </ScrollView>

      {/* 하단 완료 버튼 */}
      <View style={styles.completeButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.completeButton,
            !selectedCategory && styles.disabledCompleteButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleComplete}
          disabled={!selectedCategory}
          onPressIn={() => console.log("완료 버튼 터치됨")} // 디버깅용
          accessibilityLabel="선택 완료 버튼"
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedCategory }}
          accessibilityHint={
            selectedCategory
              ? "선택한 카테고리로 진행하려면 두 번 탭하세요"
              : "카테고리를 먼저 선택해주세요"
          }
        >
          <Text
            style={[
              styles.completeButtonText,
              !selectedCategory && styles.disabledCompleteButtonText,
            ]}
          >
            완료
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
    // 터치 영역을 명확하게 하기 위한 추가 스타일
    minHeight: 60,
    elevation: 2, // Android 그림자
    shadowColor: "#000", // iOS 그림자
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
