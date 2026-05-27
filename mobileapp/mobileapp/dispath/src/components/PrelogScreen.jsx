import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

export default function PrelogScreen({ navigation }) {
  const [truckCondition, setTruckCondition] = useState({
    tires: false,
    lights: false,
    brakes: false,
    mirrors: false,
    fluids: false,
  });
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");

  const handleToggle = (key) => {
    setTruckCondition((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (!mileage || Object.values(truckCondition).some((v) => !v)) {
      Alert.alert("Please complete all checks and enter mileage.");
      return;
    }
    // Optionally save prelog info to backend or local storage here
    navigation.replace("MainTabs");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Driver Prelog Checklist</Text>
      <Text style={styles.label}>Truck Condition (check all):</Text>
      {Object.keys(truckCondition).map((key) => (
        <TouchableOpacity
          key={key}
          style={styles.checkboxRow}
          onPress={() => handleToggle(key)}
        >
          <View style={[styles.checkbox, truckCondition[key] && styles.checked]} />
          <Text style={styles.checkboxLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.label}>Current Mileage:</Text>
      <TextInput
        style={styles.input}
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
        placeholder="Enter mileage"
      />
      <Text style={styles.label}>Additional Notes (optional):</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any issues or comments"
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f6fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#888",
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  checked: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    width: 260,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
