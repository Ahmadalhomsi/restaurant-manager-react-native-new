import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAllProducts } from '@/utils';

const Chatbot = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);

  const router = useRouter();
  const geminiApiKey = 'YOUR_API_KEY';
  const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey;

  useEffect(() => {
    const fetchProducts = async () => {
      const productData = await getAllProducts();
      if (productData) {
        setProducts(productData);
      }
    };
    fetchProducts();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Here are the available products: ${products
                    .map((p: any) => p.name)
                    .join(', ')}. Can you suggest a daily meal from these items?`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Gemini API Error: ' + response.statusText);
      }

      const data = await response.json();
      const botMessage = {
        role: 'bot',
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I didn\'t understand that.',
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: 'An error occurred. Please try again.' },
      ]);
    }

    setInput('');
  };

  const handleClose = () => {
    router.push("/customer")
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>
      <ScrollView style={styles.chatBox}>
        {messages.map((msg, index) => (
          <Text
            key={index}
            style={[styles.message, msg.role === 'user' ? styles.userMessage : styles.botMessage]}
          >
            {msg.content}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  chatBox: {
    flex: 1,
    marginTop: 40, // Kapama butonu için alan
    marginBottom: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f7c4',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3e3e3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default Chatbot;



/*import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { getAllProducts } from '@/utils'; // index.js'den getAllProducts fonksiyonunu içe aktar

const Chatbot = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]); // Tüm ürünler için state

  const geminiApiKey = ''; // Buraya kendi API anahtarınızı koyun
  const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey;

  // Ürünleri al ve state'e kaydet
  useEffect(() => {
    const fetchProducts = async () => {
      const productData = await getAllProducts(); // Veritabanından ürünleri al
      if (productData) {
        setProducts(productData); // Ürünleri state'e kaydet
      }
    };
    fetchProducts();
  }, []);

  // Yemek önerisini Gemini API'ye gönder
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Kullanıcı mesajını ekle
    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Ürünleri Gemini API'ye gönder
    try {
      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Here are the available products: ${products.map((p: any) => p.name).join(", ")}. Can you suggest a daily meal from these items?`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Gemini API Error: ' + response.statusText);
      }

      const data = await response.json();
      const botMessage = { role: 'bot', content: data.reply || 'Sorry, I didn\'t understand that.' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: 'An error occurred. Please try again.' },
      ]);
    }

    setInput(''); // Input alanını temizle
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatBox}>
        {messages.map((msg, index) => (
          <Text
            key={index}
            style={[styles.message, msg.role === 'user' ? styles.userMessage : styles.botMessage]}
          >
            {msg.content}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  chatBox: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f7c4',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3e3e3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default Chatbot;
*/