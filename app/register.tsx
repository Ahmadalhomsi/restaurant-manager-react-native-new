import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!username || !password || !confirmPassword) {
      setError("Tüm alanları doldurunuz");
      return false;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text h3 style={styles.title}>Hesap Oluştur</Text>
        
        <Input
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
          disabled={loading}
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

        <Input
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          containerStyle={styles.inputContainer}
          disabled={loading}
          leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Button
          title={loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
          onPress={handleRegister}
          containerStyle={styles.buttonContainer}
          loading={loading}
          disabled={loading}
        />

        <Button
          title="Giriş Ekranına Dön"
          onPress={() => router.back()}
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

export default RegisterScreen;