import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// const users = require('@/users.json');

export default function LoginScreen () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    // try {
    //   const user = users.find((u : any) => u.username === username);

    //   if (!user || user.password !== password) {
    //     setError('Geçersiz kullanıcı adı veya şifre');
    //     return;
    //   }

    //   const token = `fakeJWTToken_${user.username}`;
    //   await AsyncStorage.setItem('authToken', token);

    // //  router.replace('/customer'); // Redirect to the main app screen after login
    // } catch (err) {
    //   setError('Giriş yapılırken bir hata oluştu');
    //   console.error(err);
    // }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        containerStyle={styles.inputContainer}
      />
      <Input
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.inputContainer}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Giriş Yap" onPress={handleLogin} containerStyle={styles.buttonContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  inputContainer: {
    width: '100%',
    marginVertical: 10,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
});
