import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const categories = [
    { name: "경제", icon: "trending-up" as const, color: "#FF6B6B" },
    { name: "증권", icon: "bar-chart" as const, color: "#4ECDC4" },
    { name: "스포츠", icon: "football" as const, color: "#45B7D1" },
    { name: "연예", icon: "star" as const, color: "#96CEB4" },
    { name: "정치", icon: "people" as const, color: "#FECA57" },
    { name: "IT", icon: "laptop" as const, color: "#48CAE4" },
    { name: "사회", icon: "home" as const, color: "#FF9FF3" },
    { name: "오피니언", icon: "chatbubble" as const, color: "#54A0FF" },
  ];

  const handleCategoryPress = (category: string) => {
    console.log(`${category} 카테고리 선택됨`);
    router.push({
      pathname: "/categoryNews",
      params: { category: category },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? Math.max(insets.top + 20, 30) : 20 }]}>
        <Text style={[styles.title, { textAlign: "center" }]}>카테고리</Text>
        <Text style={styles.subtitle}>
          <Text style={{ textAlign: "center" }}>
            원하는 카테고리를 선택해서 최신 뉴스를 확인하세요
          </Text>
        </Text>
      </View>

      {/* 카테고리 그리드 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <Pressable
              key={category.name}
              style={({ pressed }) => [
                styles.categoryButton,
                { backgroundColor: category.color },
                pressed && styles.pressedCategoryButton,
              ]}
              onPress={() => handleCategoryPress(category.name)}
              accessibilityLabel={`${category.name} 카테고리`}
              accessibilityRole="button"
              accessibilityHint={`${category.name} 카테고리의 뉴스를 보려면 두 번 탭하세요`}
            >
              <View style={styles.categoryContent}>
                <Ionicons
                  name={category.icon}
                  size={32}
                  color="#FFFFFF"
                  style={styles.categoryIcon}
                />
                <Text style={styles.categoryText}>{category.name}</Text>
                <View style={styles.arrowIcon}>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>카테고리별 뉴스 보기</Text>
              <Text style={styles.infoDescription}>
                각 카테고리를 터치하면 해당 분야의 최신 뉴스를 확인할 수
                있습니다. 실시간으로 업데이트되는 뉴스를 놓치지 마세요!
              </Text>
            </View>
          </View>
        </View>
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
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  pressedCategoryButton: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  categoryContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  arrowIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
