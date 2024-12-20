import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useRouter } from "expo-router";
import { requestPermissionsAsync } from 'expo-notifications';

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  useEffect(() => {
    // Request permissions on app start
    (async () => {
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications is required!');
      }
    })();
  }, []);


  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text h3 style={styles.title}>Giriş Yap</Text>
        <Input
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          containerStyle={styles.inputContainer}
          disabled={loading}
          autoCapitalize="none"
          leftIcon={{ type: 'ionicon', name: 'person-outline' }}
        />
        <Input
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.inputContainer}
          disabled={loading}
          leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          onPress={handleLogin}
          containerStyle={styles.buttonContainer}
          loading={loading}
          disabled={loading}
        />
        <Button
          title="Hesap Oluştur"
          onPress={navigateToRegister}
          type="outline"
          containerStyle={styles.buttonContainer}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  }
});

export default LoginScreen;