import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from "./src/navigation/TabNavigator";
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import LoginScreen from "./src/screens/LoginScreen";

const Stack = createStackNavigator();

function PrelogScreen({ navigation, route }) {
  const driver = route?.params?.driver;
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
    // Simplified validation - just check if mileage is entered
    if (!mileage) {
      Alert.alert("Please enter mileage.");
      return;
    }
    
    // Check if all truck conditions are checked
    const allChecked = Object.values(truckCondition).every((v) => v === true);
    if (!allChecked) {
      Alert.alert("Please complete all truck condition checks.");
      return;
    }
    
    console.log("All validations passed, navigating...");
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { driver } }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Driver Prelog Checklist</Text>
      {driver && (
        <>
          <Text style={styles.subtitle}>
            Logged in as {driver.name || driver.email}
          </Text>
          <Text style={styles.subtitle}>
            {driver.currentRouteName ? `Assigned Route: ${driver.currentRouteName}` : 'No route assigned yet'}
          </Text>
        </>
      )}
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
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 12
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

export default function App() {
  console.log("App is rendering...");
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Prelog" component={PrelogScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
