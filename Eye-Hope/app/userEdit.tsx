import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UserInfo {
  deviceId: string;
  name?: string;
  email?: string;
  nickname: string;
}

interface UserUpdateData {
  deviceId: string;
  name?: string;
  email?: string;
  nickname: string;
}

export default function UserEditScreen() {
  const router = useRouter();
  const { currentUserInfo, fromSettings } = useLocalSearchParams<{
    currentUserInfo: string;
    fromSettings?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nickname: "",
  });
  const [originalData, setOriginalData] = useState<UserInfo | null>(null);
  const insets = useSafeAreaInsets();

  // 초기 데이터 설정
  useEffect(() => {
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        console.log("현재 사용자 정보:", userInfo);
        
        setOriginalData(userInfo);
        setFormData({
          name: userInfo.name || "",
          email: userInfo.email || "",
          nickname: userInfo.nickname || "",
        });
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
        Alert.alert("오류", "사용자 정보를 불러오는 중 오류가 발생했습니다.");
      }
    }
  }, [currentUserInfo]);

  // 사용자 정보 업데이트 API 호출
  const updateUserInfo = async (userData: UserUpdateData) => {
    try {
      console.log("👤 === 사용자 정보 업데이트 API 호출 시작 ===");
      console.log("📤 전송 데이터:", JSON.stringify(userData, null, 2));
      
      const response = await fetch(`http://13.124.111.205:8080/api/users/${encodeURIComponent(userData.deviceId)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name || null,
          email: userData.email || null,
          nickname: userData.nickname,
        }),
      });

      console.log("📥 응답 상태:", response.status);
      
      const result = await response.json();
      console.log("📥 응답 데이터:", JSON.stringify(result, null, 2));
      console.log("👤 === 사용자 정보 업데이트 API 호출 종료 ===");

      if (!response.ok || !result.success) {
        throw new Error(result.message || "사용자 정보 업데이트에 실패했습니다.");
      }

      return result;
    } catch (error) {
      console.error("🚨 사용자 정보 업데이트 오류:", error);
      throw error;
    }
  };

  // 변경사항 확인 (닉네임만 체크)
  const hasChanges = () => {
    if (!originalData) return false;
    
    return formData.nickname !== originalData.nickname;
  };

  // 저장 버튼 처리
  const handleSave = async () => {
    // 필수 필드 검증
    if (!formData.nickname.trim()) {
      Alert.alert("입력 오류", "닉네임은 필수 입력 항목입니다.");
      return;
    }

    // 변경사항이 없는 경우
    if (!hasChanges()) {
      Alert.alert("알림", "변경된 내용이 없습니다.");
      return;
    }

    setLoading(true);

    try {
      if (!originalData) {
        throw new Error("원본 사용자 정보를 찾을 수 없습니다.");
      }

      const updateData: UserUpdateData = {
        deviceId: originalData.deviceId,
        name: originalData.name, // 기존 값 유지
        email: originalData.email, // 기존 값 유지
        nickname: formData.nickname.trim(),
      };

      // 백엔드 API 호출
      const result = await updateUserInfo(updateData);
      
      // 업데이트된 사용자 정보
      const updatedUserInfo = {
        ...originalData,
        nickname: formData.nickname.trim(),
      };

      // AsyncStorage에 저장
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      console.log("사용자 정보가 로컬에 저장되었습니다:", updatedUserInfo);

      // 업데이트 성공 시 바로 설정 페이지로 돌아가기 (팝업 없음)
      console.log("✅ 사용자 정보 업데이트 완료 - 바로 설정 페이지로 이동");
      router.push({
        pathname: "/(tabs)/settings",
        params: {
          updatedUserInfo: JSON.stringify(updatedUserInfo),
          fromUserEdit: "true",
        },
      });

    } catch (error) {
      console.error("사용자 정보 업데이트 오류:", error);
      
      Alert.alert(
        "오류",
        "닉네임 설정에 문제가 발생했어요. 다시 입력해주세요!",
        [
          {
            text: "확인",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    if (hasChanges()) {
      Alert.alert(
        "변경사항이 있습니다",
        "저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?",
        [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "나가기",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };


  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 20) }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용자 정보 변경</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 문구 */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            닉네임을 변경할 수 있습니다.
          </Text>
          <Text style={styles.instructionSubText}>
            * 표시된 항목은 필수 입력사항입니다.
          </Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          {/* 이름 (숨김 처리) */}
          <View style={[styles.inputGroup, styles.hiddenInput]}>
            <Text style={styles.inputLabel}>이름 (선택사항)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="실명을 입력해주세요"
              placeholderTextColor="#C7C7CC"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* 이메일 (숨김 처리) */}
          <View style={[styles.inputGroup, styles.hiddenInput]}>
            <Text style={styles.inputLabel}>이메일 (선택사항)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="example@email.com"
              placeholderTextColor="#C7C7CC"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* 닉네임 (필수) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, styles.requiredLabel]}>
              닉네임 *
            </Text>
            <TextInput
              style={[styles.textInput, styles.requiredInput]}
              value={formData.nickname}
              onChangeText={(text) => setFormData({ ...formData, nickname: text })}
              placeholder="사용하실 닉네임을 입력해주세요"
              placeholderTextColor="#C7C7CC"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>
        </View>

        {/* 변경사항 안내 */}
        {hasChanges() && (
          <View style={styles.changesContainer}>
            <View style={styles.changesIcon}>
              <Ionicons name="alert-circle" size={20} color="#FF9500" />
            </View>
            <Text style={styles.changesText}>변경사항이 있습니다</Text>
          </View>
        )}

        {/* Device ID 표시 (읽기 전용) */}
        {originalData && (
          <View style={styles.deviceIdContainer}>
            <Text style={styles.deviceIdLabel}>Device ID (변경 불가)</Text>
            <Text style={styles.deviceIdValue}>
              {originalData.deviceId.substring(0, 12)}...
            </Text>
          </View>
        )}

        {/* 저장 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!formData.nickname.trim() || !hasChanges()) && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={!formData.nickname.trim() || !hasChanges() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  (!formData.nickname.trim() || !hasChanges()) && styles.disabledButtonText,
                ]}
              >
                저장
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleGoBack}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionContainer: {
    marginTop: 20,
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  instructionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 26,
  },
  instructionSubText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  // 숨김 처리 스타일 추가
  hiddenInput: {
    display: "none",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  requiredLabel: {
    color: "#FF3B30",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  requiredInput: {
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  changesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  changesIcon: {
    marginRight: 8,
  },
  changesText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
  },
  deviceIdContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  deviceIdLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 4,
  },
  deviceIdValue: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "monospace",
  },
  buttonContainer: {
    paddingBottom: 30,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#C7C7CC",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#8E8E93",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
  },
});