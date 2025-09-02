import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CategoryScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
    if (selectedCategories.includes(category)) {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>카테고리</Text>
        <Text style={styles.subtitle}>
          관심 있는 뉴스 분야를 선택하세요 (최대 5개)
        </Text>
      </View>

      {/* 카테고리 그리드 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategoryButton,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* 선택된 카테고리 요약 */}
        {selectedCategories.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>
              선택된 카테고리 ({selectedCategories.length}/5)
            </Text>
            <View style={styles.selectedCategoriesList}>
              {selectedCategories.map((category) => (
                <View key={category} style={styles.selectedCategoryTag}>
                  <Text style={styles.selectedCategoryTagText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  categoryButton: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  selectedCategoryButton: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#34C759",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  summarySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  selectedCategoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  selectedCategoryTag: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedCategoryTagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
