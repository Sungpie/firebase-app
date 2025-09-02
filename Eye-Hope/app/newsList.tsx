import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

interface NewsItem {
  id: string;
  source: string;
  title: string;
  content: string;
  createdAt: string;
  url: string;
  category: string;
  collectedAt: string;
}

interface NewsResponse {
  success: boolean;
  message: string;
  data: NewsItem[];
}

export default function NewsListScreen() {
  const { categories } = useLocalSearchParams<{ categories: string }>();
  const [newsData, setNewsData] = useState<{ [key: string]: NewsItem[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // JSON 문자열을 파싱하여 카테고리 배열로 변환
  const selectedCategories = categories ? JSON.parse(categories) : [];

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 카테고리가 없으면 에러 처리
      if (!selectedCategories || selectedCategories.length === 0) {
        throw new Error("선택된 카테고리가 없습니다.");
      }

      // 모든 카테고리에 대해 동시에 API 요청
      const promises = selectedCategories.map(async (category: string) => {
        try {
          const response = await fetch(
            `http://13.124.111.205:8080/api/news/category/${category}?size=3`
          );

          if (!response.ok) {
            throw new Error(
              `${category} 카테고리 뉴스를 불러오는데 실패했습니다.`
            );
          }

          const data: NewsResponse = await response.json();

          // API 응답 검증
          if (!data.success || !data.data) {
            throw new Error(
              `${category} 카테고리 데이터 형식이 올바르지 않습니다.`
            );
          }

          return { category, news: data.data };
        } catch (categoryError) {
          // 개별 카테고리 에러를 로그로 남기고 빈 배열 반환
          console.error(`Error fetching ${category}:`, categoryError);
          return { category, news: [] };
        }
      });

      const results = await Promise.all(promises);

      // 카테고리별로 뉴스 데이터 그룹화
      const groupedNews: { [key: string]: NewsItem[] } = {};
      results.forEach(({ category, news }) => {
        groupedNews[category] = news;
      });

      setNewsData(groupedNews);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "뉴스를 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderNewsCard = (newsItem: NewsItem, index: number) => (
    <View key={newsItem.id} style={styles.newsCard}>
      <Text
        style={styles.newsTitle}
        accessibilityLabel={`뉴스 제목 ${index + 1}: ${newsItem.title}`}
      >
        {newsItem.title}
      </Text>
      <Text
        style={styles.newsSource}
        accessibilityLabel={`언론사: ${newsItem.source}`}
      >
        {newsItem.source}
      </Text>
    </View>
  );

  const renderCategorySection = (category: string, newsItems: NewsItem[]) => (
    <View key={category} style={styles.categorySection}>
      <Text
        style={styles.categoryTitle}
        accessibilityLabel={`${category} 카테고리`}
      >
        {category}
      </Text>
      {newsItems.length > 0 ? (
        newsItems.map((newsItem, index) => renderNewsCard(newsItem, index))
      ) : (
        <View style={styles.emptyNewsCard}>
          <Text
            style={styles.emptyNewsText}
            accessibilityLabel={`${category} 카테고리에 뉴스가 없습니다`}
          >
            이 카테고리에는 현재 뉴스가 없습니다.
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>뉴스를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text
            style={styles.errorText}
            accessibilityLabel={`에러 메시지: ${error}`}
          >
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 및 안내 문구 */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle} accessibilityLabel="관심 뉴스">
          관심 뉴스
        </Text>
        <View style={styles.instructionContainer}>
          <Text
            style={styles.instructionText}
            accessibilityLabel="본문을 보고싶다면 두 번을 눌러주세요"
          >
            본문을 보고싶다면 두 번을 눌러주세요.
          </Text>
          <Text
            style={styles.instructionText}
            accessibilityLabel="다음 뉴스로 넘어가고싶다면 한 번을 눌러주세요"
          >
            다음 뉴스로 넘어가고싶다면 한 번을 눌러주세요.
          </Text>
        </View>
      </View>

      {/* 뉴스 목록 */}
      <ScrollView
        style={styles.newsListContainer}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="뉴스 목록"
      >
        {selectedCategories.map((category: string) => {
          const newsItems = newsData[category] || [];
          return renderCategorySection(category, newsItems);
        })}
      </ScrollView>

      {/* 하단 안내 문구 및 새로고침 버튼 */}
      <View style={styles.bottomInstructionContainer}>
        <Text
          style={styles.bottomInstructionText}
          accessibilityLabel="다른 기사 목록을 볼 수 있습니다"
        >
          다른 기사 목록을 볼 수 있습니다.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.pressedButton,
          ]}
          onPress={fetchNewsData}
          accessibilityLabel="뉴스 새로고침 버튼"
          accessibilityRole="button"
          accessibilityHint="최신 뉴스를 다시 불러오려면 두 번 탭하세요"
        >
          <Text style={styles.refreshButtonText}>새로고침</Text>
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
  },
  instructionContainer: {
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 4,
  },
  newsListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 16,
    textAlign: "center",
  },
  newsCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    lineHeight: 22,
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
  },
  bottomInstructionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  bottomInstructionText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    lineHeight: 24,
  },
  emptyNewsCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
  },
  emptyNewsText: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
