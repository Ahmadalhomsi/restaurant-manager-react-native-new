import { Button, Input } from '@rneui/themed';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Name"
        value={name}
        onChangeText={setName}
        containerStyle={styles.inputContainer}
        inputStyle={styles.input}
        inputContainerStyle={{ borderBottomWidth: 0 }} // Add this line
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        containerStyle={styles.inputContainer}
        inputStyle={styles.input}
        inputContainerStyle={{ borderBottomWidth: 0 }} // Add this line
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.inputContainer}
        inputStyle={styles.input}
        inputContainerStyle={{ borderBottomWidth: 0 }} // Add this line
      />
      <Button
        title="Submit"
        onPress={handleSubmit}
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    marginBottom: 16,
    borderBottomWidth: 0, // Added this line to remove the bottom border
  },
  input: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0070f3',
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 0, // Added this line to remove the border
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Form;