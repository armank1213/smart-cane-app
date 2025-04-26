import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { app } from './firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = getAuth(app);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Logged in as:', user.email);
        Alert.alert('Login Success', `Welcome back, ${user.email}`);
        navigation.navigate('HomeScreen');
      })
      .catch((error) => {
        console.error('Login error:', error.message);
        Alert.alert('Login Failed', error.message);
      });
  };

  const handleSignup = () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Registered as:', user.email);
        Alert.alert('Registration Success', `Account created for ${user.email}`);
        navigation.navigate('HomeScreen');
      })
      .catch((error) => {
        console.error('Signup error:', error.message);
        Alert.alert('Signup Failed', error.message);
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Enter Email', 'Please enter your email address first.');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Password Reset Email Sent', 'Check your inbox.');
      })
      .catch((error) => {
        console.error('Password reset error:', error.message);
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Cane</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#B0C4DE"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#B0C4DE"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F0F8FF',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 50,
  },
  input: {
    height: 55,
    backgroundColor: '#fff',
    borderColor: '#00BFFF',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#003366',
  },
  loginButton: {
    backgroundColor: '#0077CC',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotText: {
    color: '#0077CC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
