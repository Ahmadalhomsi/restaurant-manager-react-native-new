import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Button, Input, Text, Divider } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Utils from "../utils/index";
import { Ionicons } from "@expo/vector-icons";

export const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    
    if (!username || !password || !confirmPassword) {
      setError("Tüm alanları doldurunuz");
      return false;
    }

    if (username.length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalıdır");
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
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError("");

      const existingCustomers = await Utils.getAllCustomers();
      
      if (existingCustomers?.some((customer : any) => 
        customer.username.toLowerCase() === username.toLowerCase()
      )) {
        setError("Bu kullanıcı adı zaten kullanımda");
        return;
      }

      const newCustomer = {
        username: username.trim(),
        password,
        role: "Müşteri",
        createdAt: new Date().toISOString()
      };

      const createdCustomer = await Utils.createCustomer(newCustomer);

      if (!createdCustomer) {
        setError("Hesap oluşturulurken bir hata oluştu");
        return;
      }

      await AsyncStorage.setItem("customerId", createdCustomer.id.toString());
      await AsyncStorage.setItem("customerRole", createdCustomer.role);
      router.replace("/customer");

    } catch (err) {
      console.error("Registration error:", err);
      setError("Hesap oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#2089dc" style={styles.icon} />
        <Text h3 style={styles.title}>Hesap Oluştur</Text>
        
        <Input
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
          disabled={loading}
          leftIcon={{ type: 'ionicon', name: 'person-outline', color: '#2089dc' }}
        />

        <Input
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          containerStyle={styles.inputContainer}
          disabled={loading}
          leftIcon={{ type: 'ionicon', name: 'lock-closed-outline', color: '#2089dc' }}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={24} 
                color="#2089dc" 
              />
            </TouchableOpacity>
          }
        />

        <Input
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          containerStyle={styles.inputContainer}
          disabled={loading}
          leftIcon={{ type: 'ionicon', name: 'lock-closed-outline', color: '#2089dc' }}
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={24} 
                color="#2089dc" 
              />
            </TouchableOpacity>
          }
        />

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="red" />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Button
          title={loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
          onPress={handleRegister}
          containerStyle={styles.buttonContainer}
          loading={loading}
          disabled={loading}
          icon={
            !loading && {
              type: 'ionicon',
              name: 'person-add-outline',
              color: 'white',
              size: 19,
            }
          }
        />

        <Divider style={styles.divider} />

        <Button
          title="Giriş Ekranına Dön"
          onPress={() => router.back()}
          type="outline"
          containerStyle={styles.buttonContainer}
          disabled={loading}
          icon={{
            type: 'ionicon',
            name: 'arrow-back-outline',
            size: 19,
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  icon: {
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#2089dc",
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
  },
  error: {
    color: "red",
    marginLeft: 8,
  },
  divider: {
    marginVertical: 20,
  }
});

export default RegisterScreen;