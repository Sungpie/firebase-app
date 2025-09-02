import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  publishedAt: string;
}

export default function InterestNewsScreen() {
  const params = useLocalSearchParams();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<{
    morning: string;
    evening: string;
  } | null>(null);

  // 저장된 카테고리 불러오기
  useEffect(() => {
    loadCategories();
  }, []);

  // 파라미터에서 카테고리와 시간 정보 받아오기
  useEffect(() => {
    if (params.categories) {
      try {
        const categoriesFromParams = JSON.parse(params.categories as string);
        setCategories(categoriesFromParams);
        // AsyncStorage에 저장
        saveCategoriesToStorage(categoriesFromParams);
      } catch (error) {
        console.error("카테고리 파라미터 파싱 오류:", error);
      }
    }

    if (params.morningTime && params.eveningTime) {
      const times = {
        morning: params.morningTime as string,
        evening: params.eveningTime as string,
      };
      setSelectedTimes(times);
      // AsyncStorage에 시간 정보 저장
      saveTimesToStorage(times);
    }

    // selectedTimes 파라미터도 처리 (JSON 문자열 형태)
    if (params.selectedTimes) {
      try {
        const times = JSON.parse(params.selectedTimes as string);
        if (times.morning && times.evening) {
          setSelectedTimes(times);
          // AsyncStorage에 시간 정보 저장
          saveTimesToStorage(times);
        }
      } catch (error) {
        console.error("시간 파라미터 파싱 오류:", error);
      }
    }
  }, [
    params.categories,
    params.morningTime,
    params.eveningTime,
    params.selectedTimes,
  ]);

  // 화면이 포커스될 때마다 카테고리 새로고침
  useFocusEffect(
    React.useCallback(() => {
      console.log("관심뉴스 화면 포커스됨");
      loadCategories();
    }, [])
  );

  // 카테고리가 변경될 때마다 뉴스 다시 불러오기
  useEffect(() => {
    console.log("카테고리 변경 감지:", categories);
    if (categories.length > 0) {
      fetchNews();
    } else {
      setLoading(false);
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem("userCategories");
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        setCategories(parsedCategories);
      } else {
        // 기본 카테고리 설정
        const defaultCategories = ["경제", "정치", "사회"];
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error("카테고리 로드 오류:", error);
      // 기본 카테고리로 설정
      setCategories(["경제", "정치", "사회"]);
    }
  };

  const saveCategoriesToStorage = async (categories: string[]) => {
    try {
      await AsyncStorage.setItem("userCategories", JSON.stringify(categories));
      console.log("카테고리가 저장되었습니다:", categories);
    } catch (error) {
      console.error("카테고리 저장 오류:", error);
    }
  };

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

  const fetchNews = async () => {
    if (categories.length === 0) return;

    setLoading(true);
    console.log("뉴스 가져오기 시작, 카테고리:", categories);

    try {
      const newsPromises = categories.map(async (category) => {
        try {
          const url = `http://13.124.111.205:8080/api/news/category/${encodeURIComponent(
            category
          )}?size=3`;
          console.log(`${category} 카테고리 API 호출:`, url);

          const response = await fetch(url);
          console.log(`${category} 응답 상태:`, response.status);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log(`${category} 응답 데이터:`, data);

          // 데이터 구조 확인 및 변환
          if (data && Array.isArray(data)) {
            return data;
          } else if (data && Array.isArray(data.data)) {
            console.log(
              `${category} 카테고리: data 필드에서 뉴스 찾음, 개수:`,
              data.data.length
            );
            return data.data;
          } else if (data && Array.isArray(data.content)) {
            return data.content;
          } else if (data && Array.isArray(data.articles)) {
            return data.articles;
          } else {
            console.log(`${category} 카테고리: 예상치 못한 데이터 구조:`, data);
            return [];
          }
        } catch (error) {
          console.error(`${category} 카테고리 뉴스 가져오기 실패:`, error);
          return [];
        }
      });

      const allNews = await Promise.all(newsPromises);
      console.log("모든 뉴스 데이터:", allNews);
      console.log(
        "각 카테고리별 뉴스 개수:",
        allNews.map((news, index) => `${categories[index]}: ${news.length}개`)
      );

      const flattenedNews = allNews.flat().map((news, index) => ({
        id: news.id || news.articleId || `news-${index}`,
        title: news.title || news.headline || "제목 없음",
        content: news.content || news.summary || "내용 없음",
        category: news.category || news.section || "기타",
        source: news.source || news.publisher || "출처 없음",
        publishedAt:
          news.publishedAt ||
          news.createdAt ||
          news.publishDate ||
          new Date().toISOString(),
      }));

      console.log("변환된 뉴스 데이터:", flattenedNews);
      setNewsData(flattenedNews);
    } catch (error) {
      console.error("뉴스 가져오기 오류:", error);
      Alert.alert("오류", "뉴스를 가져오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const formatTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInHours = Math.floor(
      (now.getTime() - published.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>관심뉴스</Text>
          <Text style={styles.subtitle}>뉴스를 불러오는 중...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>뉴스를 불러오는 중입니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>관심뉴스</Text>
        <Text style={styles.subtitle}>
          {categories.length > 0
            ? `${categories.join(", ")} 카테고리의 최신 뉴스입니다`
            : "설정에서 관심 카테고리를 선택해주세요"}
        </Text>
      </View>

      {/* 뉴스 목록 */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {newsData.length > 0 ? (
          <View style={styles.newsSection}>
            <Text style={styles.sectionTitle}>오늘의 주요 뉴스</Text>

            {newsData.map((news) => (
              <View key={news.id} style={styles.newsCard}>
                <View style={styles.newsHeader}>
                  <Text style={styles.newsCategory}>{news.category}</Text>
                  <Text style={styles.newsTime}>
                    {formatTimeAgo(news.publishedAt)}
                  </Text>
                </View>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsSource}>{news.source}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>뉴스가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              설정에서 관심 카테고리를 선택하거나{"\n"}새로고침을 시도해보세요
            </Text>
          </View>
        )}

        {/* 선택된 시간 정보 표시 */}
        {selectedTimes && (
          <View style={styles.timeInfoSection}>
            <Text style={styles.timeInfoTitle}>설정된 알림 시간</Text>
            <View style={styles.timeInfoContainer}>
              <Text style={styles.timeInfoText}>
                아침: {selectedTimes.morning} | 저녁: {selectedTimes.evening}
              </Text>
            </View>
          </View>
        )}

        {/* 새로고침 버튼 */}
        <View style={styles.refreshSection}>
          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={refreshing ? "#C7C7CC" : "#007AFF"}
            />
            <Text
              style={[styles.refreshText, refreshing && styles.refreshingText]}
            >
              {refreshing ? "새로고침 중..." : "새로고침"}
            </Text>
          </Pressable>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#C7C7CC",
    textAlign: "center",
    lineHeight: 22,
  },
  newsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  newsCategory: {
    backgroundColor: "#007AFF",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "500",
  },
  newsTime: {
    fontSize: 12,
    color: "#8E8E93",
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
    color: "#8E8E93",
    fontStyle: "italic",
  },
  refreshSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  refreshingText: {
    color: "#C7C7CC",
  },
  timeInfoSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  timeInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  timeInfoContainer: {
    alignItems: "center",
  },
  timeInfoText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    textAlign: "center",
  },
});
