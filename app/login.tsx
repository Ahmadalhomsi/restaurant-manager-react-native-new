import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, Text, Icon } from "@rneui/themed";
import { useRouter } from "expo-router";
import * as Notifications from 'expo-notifications';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Utils from "../utils/index";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkNotificationPermissions();
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const customerId = await AsyncStorage.getItem("customerId");
      const customerRole = await AsyncStorage.getItem("customerRole");
      
      if (customerId && customerRole) {
        router.replace(customerRole === "Admin" ? "/manager" : "/customer");
      }
    } catch (err) {
      console.error("Session check error:", err);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      setNotificationStatus(status);

      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const customers = await Utils.getAllCustomers();

      if (!customers) {
        throw new Error("Sunucu bağlantısında hata oluştu");
      }

      const customer = customers.find((c: any) => c.username.toLowerCase() === username.toLowerCase());

      if (!customer) {
        throw new Error("Kullanıcı bulunamadı");
      }

      if (customer.password !== password) {
        throw new Error("Geçersiz şifre");
      }

      await AsyncStorage.multiSet([
        ["customerId", customer.id.toString()],
        ["customerRole", customer.role]
      ]);

      router.replace(customer.role === "Admin" ? "/manager" : "/customer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılırken bir hata oluştu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = async () => {
    try {
      if (notificationStatus !== 'granted') {
        await checkNotificationPermissions();
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Bildirimi',
          body: 'Bu bir test bildirimidir.',
          data: { type: 'test' },
        },
        trigger: {
          seconds: 2,
          channelId: 'default',
        },
      });

      console.log('Bildirim gönderildi');
    } catch (error) {
      console.error('Bildirim hatası:', error);
      setError('Bildirim gönderilemedi');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Icon
            name="restaurant-menu"
            size={60}
            color="#007bff"
          />
          <Text h3 style={styles.title}>Restoran Yönetimi</Text>
        </View>

        <Input
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError("");
          }}
          containerStyle={styles.inputContainer}
          disabled={loading}
          autoCapitalize="none"
          leftIcon={{ type: 'ionicon', name: 'person-outline', color: '#007bff' }}
          errorMessage={error && username.length === 0 ? "Kullanıcı adı gerekli" : ""}
        />

        <Input
          placeholder="Şifre"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry={!showPassword}
          containerStyle={styles.inputContainer}
          disabled={loading}
          leftIcon={{ type: 'ionicon', name: 'lock-closed-outline', color: '#007bff' }}
          rightIcon={
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon
                type="ionicon"
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                color="#007bff"
              />
            </TouchableOpacity>
          }
          errorMessage={error && password.length === 0 ? "Şifre gerekli" : ""}
        />

        {error && !error.includes("gerekli") && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Button
          title={loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          onPress={handleLogin}
          containerStyle={styles.buttonContainer}
          loading={loading}
          disabled={loading}
          icon={{
            name: "login",
            color: "white",
            size: 20,
          }}
        />

        <Button
          title="Hesap Oluştur"
          onPress={() => router.push("/register")}
          type="outline"
          containerStyle={styles.buttonContainer}
          disabled={loading}
          icon={{
            name: "person-add",
            size: 20,
          }}
        />

        <Button
          title="Test Bildirimi Gönder"
          onPress={handleNotification}
          type="clear"
          containerStyle={styles.notificationButton}
          icon={{
            name: "notifications",
            size: 20,
            color: "#007bff"
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    textAlign: "center",
    marginTop: 10,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  notificationButton: {
    marginTop: 20,
  },
  error: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffe6e6",
    borderRadius: 5,
  }
});

export default LoginScreen;