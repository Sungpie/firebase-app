import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InterestNewsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>관심뉴스</Text>
        <Text style={styles.subtitle}>
          선택한 카테고리의 최신 뉴스를 확인하세요
        </Text>
      </View>

      {/* 뉴스 목록 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>오늘의 주요 뉴스</Text>

          {/* 샘플 뉴스 카드들 */}
          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Text style={styles.newsCategory}>경제</Text>
              <Text style={styles.newsTime}>2시간 전</Text>
            </View>
            <Text style={styles.newsTitle}>
              시장 전망 긍정적, 투자자들 낙관적 전망
            </Text>
            <Text style={styles.newsSource}>경제일보</Text>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Text style={styles.newsCategory}>사회</Text>
              <Text style={styles.newsTime}>4시간 전</Text>
            </View>
            <Text style={styles.newsTitle}>
              새로운 정책 발표, 시민들 반응 긍정적
            </Text>
            <Text style={styles.newsSource}>사회뉴스</Text>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Text style={styles.newsCategory}>기술</Text>
              <Text style={styles.newsTime}>6시간 전</Text>
            </View>
            <Text style={styles.newsTitle}>
              AI 기술 발전, 일상생활 변화 가져와
            </Text>
            <Text style={styles.newsSource}>기술뉴스</Text>
          </View>
        </View>

        {/* 새로고침 버튼 */}
        <View style={styles.refreshSection}>
          <Pressable style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.refreshText}>새로고침</Text>
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
});
