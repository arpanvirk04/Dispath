import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login success', data);
        navigation.replace('Prelog', { driver: data });
      } else if (response.status === 401) {
        console.log('Login failed: invalid credentials');
        Alert.alert('Login Failed', 'Invalid email or password.');
      } else {
        const message = await response.text();
        console.log('Login error response', message);
        Alert.alert('Error', message || 'Unable to login.');
      }
    } catch (error) {
      console.error('Login error', error);
      Alert.alert('Network Error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DisPath Driver Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1d3a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 32
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16
  },
  button: {
    width: '100%',
    backgroundColor: '#ff9800',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default LoginScreen;
