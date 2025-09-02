import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function TimeSelectScreen() {
  const { categories } = useLocalSearchParams<{ categories: string }>();
  const router = useRouter();

  // JSON 문자열을 파싱하여 카테고리 배열로 변환
  const selectedCategories = categories ? JSON.parse(categories) : [];
  const [selectedMorningTime, setSelectedMorningTime] = useState<string | null>(
    null
  );
  const [selectedEveningTime, setSelectedEveningTime] = useState<string | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const morningTimes = [
    "5시",
    "6시",
    "7시",
    "8시",
    "9시",
    "10시",
    "11시",
    "12시",
    "13시",
  ];
  const eveningTimes = [
    "13시",
    "14시",
    "15시",
    "16시",
    "17시",
    "18시",
    "19시",
    "20시",
    "21시",
  ];

  const handleMorningTimeSelect = (time: string) => {
    setSelectedMorningTime(time);
  };

  const handleEveningTimeSelect = (time: string) => {
    setSelectedEveningTime(time);
  };

  const handleComplete = () => {
    if (selectedMorningTime && selectedEveningTime) {
      setIsModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleConfirm = () => {
    console.log("선택된 시간:", {
      아침: selectedMorningTime,
      저녁: selectedEveningTime,
    });
    setIsModalVisible(false);
    // newsList 화면으로 이동하면서 categories 파라미터 전달
    router.push({
      pathname: "/newsList",
      params: { categories: categories },
    });
  };

  const renderTimeButton = (
    time: string,
    isSelected: boolean,
    onPress: () => void,
    accessibilityLabel: string
  ) => (
    <Pressable
      style={[styles.timeButton, isSelected && styles.selectedTimeButton]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityHint="이 시간을 선택하려면 두 번 탭하세요"
    >
      <Text
        style={[
          styles.timeButtonText,
          isSelected && styles.selectedTimeButtonText,
        ]}
      >
        {time}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 안내 문구 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          매일 아침 / 저녁으로 핫한 뉴스를 알림으로 보내드려요.
        </Text>
        <Text style={styles.instructionTextBlue}>
          어느 시간 대를 원하는지 골라주세요.
        </Text>
      </View>

      {/* 시간 선택 영역 */}
      <ScrollView
        style={styles.timeSelectionContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeGridContainer}>
          {/* 아침 섹션 */}
          <View style={styles.timeSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>아침</Text>
            </View>
            <View style={styles.timeButtonsContainer}>
              {morningTimes.map((time) => (
                <View key={time} style={styles.timeButtonWrapper}>
                  {renderTimeButton(
                    time,
                    selectedMorningTime === time,
                    () => handleMorningTimeSelect(time),
                    `${time} 아침 시간 선택`
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* 저녁 섹션 */}
          <View style={styles.timeSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>저녁</Text>
            </View>
            <View style={styles.timeButtonsContainer}>
              {eveningTimes.map((time) => (
                <View key={time} style={styles.timeButtonWrapper}>
                  {renderTimeButton(
                    time,
                    selectedEveningTime === time,
                    () => handleEveningTimeSelect(time),
                    `${time} 저녁 시간 선택`
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 완료 버튼 */}
      <View style={styles.completeButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.completeButton,
            (!selectedMorningTime || !selectedEveningTime) &&
              styles.disabledCompleteButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleComplete}
          disabled={!selectedMorningTime || !selectedEveningTime}
          accessibilityLabel="완료 버튼"
          accessibilityRole="button"
          accessibilityState={{
            disabled: !selectedMorningTime || !selectedEveningTime,
          }}
          accessibilityHint={
            selectedMorningTime && selectedEveningTime
              ? "선택한 시간으로 진행하려면 두 번 탭하세요"
              : "아침과 저녁 시간을 모두 선택해주세요"
          }
        >
          <Text
            style={[
              styles.completeButtonText,
              (!selectedMorningTime || !selectedEveningTime) &&
                styles.disabledCompleteButtonText,
            ]}
          >
            완료
          </Text>
        </Pressable>
      </View>

      {/* 확인 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
        accessibilityLabel="시간 선택 확인 모달"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>선택한 시간은</Text>

            <View style={styles.selectedTimesContainer}>
              <Text style={styles.selectedTimeText}>
                아침 {selectedMorningTime}
              </Text>
              <Text style={styles.selectedTimeText}>
                저녁 {selectedEveningTime}
              </Text>
            </View>

            <Text style={styles.modalQuestion}>
              이 시간 대에 뉴스 알림을 보내드릴까요?
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalConfirmButton,
                  pressed && styles.pressedButton,
                ]}
                onPress={handleConfirm}
                accessibilityLabel="맞아요 버튼"
                accessibilityRole="button"
                accessibilityHint="선택한 시간이 맞다면 두 번 탭하세요"
              >
                <Text style={styles.modalConfirmButtonText}>맞아요.</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalModifyButton,
                  pressed && styles.pressedButton,
                ]}
                onPress={handleModalClose}
                accessibilityLabel="수정할게요 버튼"
                accessibilityRole="button"
                accessibilityHint="시간을 수정하려면 두 번 탭하세요"
              >
                <Text style={styles.modalModifyButtonText}>수정할게요.</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000000",
    lineHeight: 24,
    marginBottom: 8,
  },
  instructionTextBlue: {
    fontSize: 16,
    textAlign: "center",
    color: "#007AFF",
    lineHeight: 24,
    fontWeight: "500",
  },
  timeSelectionContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  timeGridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionHeader: {
    backgroundColor: "#87CEEB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timeButtonsContainer: {
    alignItems: "center",
  },
  timeButtonWrapper: {
    marginBottom: 12,
    width: "100%",
  },
  timeButton: {
    backgroundColor: "#87CEEB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedTimeButton: {
    backgroundColor: "#007AFF",
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  selectedTimeButtonText: {
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
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#87CEEB",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    textAlign: "center",
  },
  selectedTimesContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  selectedTimeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
    textAlign: "center",
  },
  modalQuestion: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#87CEEB",
  },
  modalConfirmButton: {
    borderColor: "#87CEEB",
  },
  modalModifyButton: {
    borderColor: "#87CEEB",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalModifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
