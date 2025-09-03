import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  publishedAt: string;
}

export default function CategoryNewsScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (category) {
      fetchNews(0, true);
    }
  }, [category]);

  const fetchNews = async (pageNum: number = 0, isRefresh: boolean = false) => {
    if (!category) return;

    try {
      if (isRefresh) {
        setLoading(true);
      }

      const url = `http://13.124.111.205:8080/api/news/search?keyword=${encodeURIComponent(
        category
      )}&page=${pageNum}&size=10`;
      
      console.log(`${category} 카테고리 뉴스 API 호출:`, url);

      const response = await fetch(url);
      console.log(`${category} 응답 상태:`, response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${category} 응답 데이터:`, data);

      // 데이터 구조 확인 및 변환
      let newsArray = [];
      if (data && Array.isArray(data)) {
        newsArray = data;
      } else if (data && Array.isArray(data.data)) {
        newsArray = data.data;
      } else if (data && Array.isArray(data.content)) {
        newsArray = data.content;
      } else if (data && Array.isArray(data.articles)) {
        newsArray = data.articles;
      } else {
        console.log(`${category} 카테고리: 예상치 못한 데이터 구조:`, data);
        newsArray = [];
      }

      const processedNews = newsArray.map((news: any, index: number) => ({
        id: news.id || news.articleId || `news-${pageNum}-${index}`,
        title: news.title || news.headline || "제목 없음",
        content: news.content || news.summary || "내용 없음",
        category: news.category || category || "기타",
        source: news.source || news.publisher || "출처 없음",
        publishedAt:
          news.publishedAt ||
          news.createdAt ||
          news.publishDate ||
          new Date().toISOString(),
      }));

      if (isRefresh || pageNum === 0) {
        setNewsData(processedNews);
        setPage(0);
      } else {
        setNewsData((prevNews) => [...prevNews, ...processedNews]);
      }

      // 더 불러올 데이터가 있는지 확인
      setHasMore(processedNews.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error(`${category} 카테고리 뉴스 가져오기 오류:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNews(page + 1, false);
    }
  };

  const handleGoBack = () => {
    router.back();
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

  if (loading && newsData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </Pressable>
          <Text style={styles.title}>{category} 뉴스</Text>
          <View style={styles.placeholder} />
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
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.title}>{category} 뉴스</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 뉴스 목록 */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {newsData.length > 0 ? (
          <>
            <View style={styles.newsSection}>
              <Text style={styles.sectionTitle}>
                {category} 관련 뉴스 ({newsData.length}개)
              </Text>

              {newsData.map((news) => (
                <View key={news.id} style={styles.newsCard}>
                  <View style={styles.newsHeader}>
                    <Text style={styles.newsCategory}>{news.category}</Text>
                    <Text style={styles.newsTime}>
                      {formatTimeAgo(news.publishedAt)}
                    </Text>
                  </View>
                  <Text style={styles.newsTitle} numberOfLines={3}>
                    {news.title}
                  </Text>
                  <Text style={styles.newsContent} numberOfLines={2}>
                    {news.content}
                  </Text>
                  <Text style={styles.newsSource}>{news.source}</Text>
                </View>
              ))}
            </View>

            {/* 로딩 더 보기 */}
            {loading && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadMoreText}>더 많은 뉴스를 불러오는 중...</Text>
              </View>
            )}

            {/* 더 이상 뉴스가 없을 때 */}
            {!hasMore && newsData.length > 0 && (
              <View style={styles.noMoreContainer}>
                <Text style={styles.noMoreText}>모든 뉴스를 확인했습니다</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>뉴스가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              {category} 관련 뉴스를 찾을 수 없습니다.{"\n"}새로고침을 시도해보세요.
            </Text>
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
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
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
    fontSize: 18,
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
  newsContent: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#8E8E93",
  },
  noMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  noMoreText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
});