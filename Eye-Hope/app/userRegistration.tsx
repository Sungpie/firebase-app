import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

interface UserRegistrationData {
  deviceId: string;
  name?: string;
  email?: string;
  nickname: string;
  password?: string;
}

interface UserUpdateData {
  deviceId: string;
  name?: string;
  email?: string;
  nickname: string;
}

interface NotificationScheduleData {
  deviceId: string;
  notificationTime: string[];
}

export default function UserRegistrationScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { categories, selectedTimes } = useLocalSearchParams<{
    categories: string;
    selectedTimes: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nickname: "",
  });
  const insets = useSafeAreaInsets();

  // 파라미터에서 데이터 파싱 및 디버깅
  const selectedCategories = categories ? JSON.parse(categories) : [];
  
  console.log("🔍 === UserRegistration 파라미터 디버깅 ===");
  console.log("📋 categories (raw):", categories);
  console.log("📋 selectedTimes (raw):", selectedTimes);
  console.log("📋 selectedCategories (parsed):", selectedCategories);
  
  let timeData = null;
  try {
    timeData = selectedTimes ? JSON.parse(selectedTimes) : null;
    console.log("⏰ timeData (parsed):", timeData);
    console.log("⏰ timeData type:", typeof timeData);
    if (timeData) {
      console.log("⏰ timeData.morning:", timeData.morning);
      console.log("⏰ timeData.evening:", timeData.evening);
    }
  } catch (parseError) {
    console.error("❌ selectedTimes 파싱 오류:", parseError);
    console.error("❌ selectedTimes 원본:", selectedTimes);
  }
  console.log("🔍 =======================================");

  // DeviceId 생성 또는 가져오기
  const getOrCreateDeviceId = async (): Promise<string> => {
    try {
      let deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = uuid.v4() as string;
        await AsyncStorage.setItem("deviceId", deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error("DeviceId 생성/조회 오류:", error);
      return uuid.v4() as string;
    }
  };

  // 사용자 존재 여부 확인
  const checkUserExists = async (deviceId: string): Promise<boolean> => {
    try {
      console.log("👤 사용자 존재 여부 확인 중:", deviceId);
      
      const response = await fetch(`https://eyehope.site/api/users/${encodeURIComponent(deviceId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("👤 사용자 존재 확인 응답 상태:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("👤 사용자 존재 확인 응답:", result);
        return result.success && result.data;
      }
      
      return false;
    } catch (error) {
      console.error("👤 사용자 존재 확인 오류:", error);
      return false;
    }
  };

  // 사용자 등록 API 호출
  const registerUser = async (userData: UserRegistrationData) => {
    try {
      console.log("👤 === 사용자 등록 API 호출 시작 ===");
      console.log("📤 전송 데이터:", JSON.stringify(userData, null, 2));
      
      const response = await fetch("https://eyehope.site/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: userData.deviceId,
          name: userData.name || null,
          email: userData.email || null,
          nickname: userData.nickname,
          password: null,
        }),
      });

      const result = await response.json();
      console.log("👤 사용자 등록 응답:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "사용자 등록에 실패했습니다.");
      }

      return result;
    } catch (error) {
      console.error("👤 사용자 등록 오류:", error);
      throw error;
    }
  };

  // 사용자 정보 업데이트 API 호출 (새로 추가)
  const updateUser = async (userData: UserUpdateData) => {
    try {
      console.log("🔄 === 사용자 정보 업데이트 API 호출 시작 ===");
      console.log("📤 전송 데이터:", JSON.stringify(userData, null, 2));
      
      const response = await fetch(`https://eyehope.site/api/users/${encodeURIComponent(userData.deviceId)}`, {
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

      const result = await response.json();
      console.log("🔄 사용자 정보 업데이트 응답:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "사용자 정보 업데이트에 실패했습니다.");
      }

      return result;
    } catch (error) {
      console.error("🔄 사용자 정보 업데이트 오류:", error);
      throw error;
    }
  };

  // 시간 형식 변환 함수 (HH:MM 형식 확인 및 변환)
  const convertTimeFormat = (timeString: string): string => {
    console.log("🔄 convertTimeFormat 호출:", timeString);
    
    if (!timeString) {
      console.log("   ❌ 입력값이 없음");
      return "";
    }
    
    // 이미 HH:MM 형식인 경우 그대로 반환
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      console.log("   ✅ 이미 HH:MM 형식:", timeString);
      return timeString;
    }
    
    // "9시" → "09:00" 형식으로 변환 (기존 호환성)
    const hourMatch = timeString.match(/(\d+)시/);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1]);
      const result = hour.toString().padStart(2, '0') + ':00';
      console.log("   ✅ '시' 형식 변환:", timeString, "→", result);
      return result;
    }
    
    console.log("   ⚠️ 변환할 수 없는 형식, 원본 반환:", timeString);
    return timeString;
  };

  // 알림 시간 등록 API 호출
  const registerNotificationSchedule = async (scheduleData: NotificationScheduleData) => {
    try {
      console.log("🌐 === 알림 시간 등록 API 호출 시작 ===");
      console.log("📤 전송 데이터:", JSON.stringify(scheduleData, null, 2));
      
      const response = await fetch("https://eyehope.site/api/users/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      console.log("📥 응답 상태:", response.status);
      
      const result = await response.json();
      console.log("📥 응답 데이터:", JSON.stringify(result, null, 2));
      console.log("🌐 === 알림 시간 등록 API 호출 종료 ===");

      if (!response.ok || !result.success) {
        throw new Error(result.message || "알림 시간 등록에 실패했습니다.");
      }

      return result;
    } catch (error) {
      console.error("🚨 알림 시간 등록 오류:", error);
      throw error;
    }
  };

  // 설정 완료 플래그 저장
  const saveSetupCompleted = async () => {
    try {
      await AsyncStorage.setItem("setupCompleted", "true");
      console.log("설정 완료 플래그가 저장되었습니다");
    } catch (error) {
      console.error("설정 완료 플래그 저장 오류:", error);
    }
  };

  // 완료 버튼 처리 (수정됨)
  const handleComplete = async () => {
    // 필수 필드 검증 (닉네임만)
    if (!formData.nickname.trim()) {
      Alert.alert("입력 오류", "닉네임은 필수 입력 항목입니다.");
      return;
    }

    setLoading(true);

    try {
      // DeviceId 생성/가져오기
      const deviceId = await getOrCreateDeviceId();
      console.log("🆔 DeviceId:", deviceId);

      // 사용자 존재 여부 확인
      const userExists = await checkUserExists(deviceId);
      console.log("👤 사용자 존재 여부:", userExists);

      // 사용자가 존재하면 업데이트, 존재하지 않으면 등록
      if (userExists) {
        console.log("🔄 기존 사용자 정보 업데이트 진행");
        const userUpdateData: UserUpdateData = {
          deviceId: deviceId,
          name: undefined, // 빈 값 대신 undefined
          email: undefined, // 빈 값 대신 undefined
          nickname: formData.nickname.trim(),
        };

        await updateUser(userUpdateData);
        console.log("✅ 사용자 정보 업데이트 성공");
      } else {
        console.log("👤 새 사용자 등록 진행");
        const userRegistrationData: UserRegistrationData = {
          deviceId: deviceId,
          name: undefined, // 빈 값 대신 undefined
          email: undefined, // 빈 값 대신 undefined
          nickname: formData.nickname.trim(),
          password: undefined,
        };

        await registerUser(userRegistrationData);
        console.log("✅ 사용자 등록 성공");
      }

      // 사용자 정보를 AsyncStorage에 저장
      await AsyncStorage.setItem("userInfo", JSON.stringify({
        deviceId: deviceId,
        name: "", // 빈 값으로 저장
        email: "", // 빈 값으로 저장
        nickname: formData.nickname.trim(),
      }));

      // 설정 완료 플래그 저장
      await saveSetupCompleted();

      // 알림 시간 등록 (별도 처리 - 실패해도 진행)
      let notificationSuccess = true;
      
      console.log("⏰ === 알림 시간 등록 프로세스 시작 ===");
      console.log("⏰ timeData:", timeData);
      
      if (timeData && timeData.morning && timeData.evening) {
        try {
          // 시간 변환
          const morningTime = convertTimeFormat(timeData.morning);
          const eveningTime = convertTimeFormat(timeData.evening);
          
          console.log("⏰ 변환된 시간 - 아침:", morningTime, "저녁:", eveningTime);
          
          if (!morningTime || !eveningTime) {
            throw new Error("시간 변환 실패");
          }
          
          const notificationScheduleData: NotificationScheduleData = {
            deviceId: deviceId,
            notificationTime: [morningTime, eveningTime],
          };

          await registerNotificationSchedule(notificationScheduleData);
          console.log("✅ 알림 시간 등록 성공!");
          
        } catch (notificationError) {
          console.error("❌ 알림 시간 등록 실패:", notificationError);
          notificationSuccess = false;
        }
      } else {
        console.log("⏰ timeData 없음 - 기본 알림 시간으로 등록");
        try {
          // 기본 알림 시간으로 전송 (09:00, 12:45)
          const defaultData: NotificationScheduleData = {
            deviceId: deviceId,
            notificationTime: ["09:00", "12:45"],
          };
          
          await registerNotificationSchedule(defaultData);
          console.log("✅ 기본 알림 시간으로 등록 성공!");
        } catch (defaultError) {
          console.error("❌ 기본 알림 시간 등록 실패:", defaultError);
          notificationSuccess = false;
        }
      }

      // 등록 성공 시 바로 관심뉴스 페이지로 이동 (팝업 없음)
      console.log("✅ 사용자 등록 완료 - 바로 관심뉴스 페이지로 이동");
      router.push({
        pathname: "/(tabs)",
        params: {
          categories: categories,
          selectedTimes: selectedTimes,
        },
      });

    } catch (error) {
      console.error("등록 과정 오류:", error);
      
      Alert.alert(
        "오류",
        "닉네임 설정에 문제가 발생했어요. 다시 입력해주세요!",
        [{ text: "확인" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // 뒤로가기 버튼 처리
  useFocusEffect(
    React.useCallback(() => {
      // iOS 스와이프 제스처 비활성화
      navigation.setOptions({
        gestureEnabled: false,
      });

      const backAction = () => {
        Alert.alert(
          "앱 종료",
          "앱을 종료하시겠습니까?",
          [
            {
              text: "취소",
              onPress: () => null,
              style: "cancel"
            },
            {
              text: "종료",
              onPress: () => BackHandler.exitApp()
            }
          ]
        );
        return true; // 기본 뒤로가기 동작을 막음
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => {
        backHandler.remove();
        // 화면을 벗어날 때 제스처 다시 활성화
        navigation.setOptions({
          gestureEnabled: true,
        });
      };
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>사용자 정보 입력</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내 문구 */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            마지막 단계입니다!{"\n"}닉네임을 입력해주세요.
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
              onSubmitEditing={handleComplete}
            />
          </View>
        </View>

        {/* 설정 요약 */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>설정 요약</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>관심 분야:</Text>
            <Text style={styles.summaryValue}>
              {selectedCategories.join(", ")}
            </Text>
          </View>

          {timeData && timeData.morning && timeData.evening && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>알림 시간:</Text>
              <Text style={styles.summaryValue}>
                아침 {timeData.morning}, 저녁 {timeData.evening}
              </Text>
            </View>
          )}
        </View>

        {/* 완료 버튼 */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.completeButton,
              !formData.nickname.trim() && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
            onPress={handleComplete}
            disabled={!formData.nickname.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.completeButtonText,
                  !formData.nickname.trim() && styles.disabledButtonText,
                ]}
              >
                등록 완료
              </Text>
            )}
          </Pressable>
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
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: "#000000",
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 30,
  },
  completeButton: {
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
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#8E8E93",
  },
});