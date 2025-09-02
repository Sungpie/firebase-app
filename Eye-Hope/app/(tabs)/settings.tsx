import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const settingsItems = [
    {
      id: "notifications",
      title: "푸시 알림",
      subtitle: "뉴스 업데이트 알림을 받습니다",
      type: "switch",
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
      icon: "notifications",
    },
    {
      id: "darkMode",
      title: "다크 모드",
      subtitle: "어두운 테마를 사용합니다",
      type: "switch",
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
      icon: "moon",
    },
    {
      id: "autoRefresh",
      title: "자동 새로고침",
      subtitle: "주기적으로 뉴스를 업데이트합니다",
      type: "switch",
      value: autoRefreshEnabled,
      onValueChange: setAutoRefreshEnabled,
      icon: "refresh",
    },
    {
      id: "about",
      title: "앱 정보",
      subtitle: "버전 및 라이선스 정보",
      type: "navigate",
      icon: "information-circle",
    },
    {
      id: "help",
      title: "도움말",
      subtitle: "사용법 및 FAQ",
      type: "navigate",
      icon: "help-circle",
    },
    {
      id: "feedback",
      title: "피드백",
      subtitle: "의견 및 버그 신고",
      type: "navigate",
      icon: "chatbubble",
    },
  ];

  const renderSettingItem = (item: any) => (
    <View key={item.id} style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>

      {item.type === "switch" ? (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>앱 사용 환경을 맞춤 설정하세요</Text>
      </View>

      {/* 설정 목록 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>일반</Text>
          {settingsItems.slice(0, 3).map(renderSettingItem)}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>정보</Text>
          {settingsItems.slice(3).map(renderSettingItem)}
        </View>

        {/* 앱 버전 정보 */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Eye-Hope v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Eye-Hope Team</Text>
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
  settingsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 18,
  },
  versionSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 14,
    color: "#C7C7CC",
  },
});
