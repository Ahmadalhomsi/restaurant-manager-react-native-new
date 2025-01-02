import React from 'react';
import { View, Text, StyleSheet, Alert, Animated, Dimensions } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Button, Icon } from "@rneui/themed";
import { useRouter } from "expo-router";

interface ConnectivityState {
  isConnected: boolean | null;
  fadeAnim: Animated.Value;
}

class Connectivity extends React.Component<{}, ConnectivityState> {
  unsubscribe?: () => void;

  constructor(props: {}) {
    super(props);
    this.state = {
      isConnected: null,
      fadeAnim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    // Start fade-in animation
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Set up connectivity listener
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleConnectivityChange = (state: NetInfoState) => {
    const isConnected = state.isConnected;
    this.setState({ isConnected });

    if (isConnected === false) {
      Alert.alert(
        'Bağlantı Hatası',
        'Lütfen internet bağlantınızı kontrol edin.',
        [{ text: 'Tamam', style: 'default' }]
      );
    }
  };

  getStatusColor = () => {
    const { isConnected } = this.state;
    if (isConnected === null) return '#f0ad4e'; // warning
    return isConnected ? '#28a745' : '#dc3545'; // success : danger
  };

  getStatusIcon = () => {
    const { isConnected } = this.state;
    if (isConnected === null) return 'help-circle';
    return isConnected ? 'wifi' : 'wifi-off';
  };

  render() {
    const { isConnected, fadeAnim } = this.state;

    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon
              name={this.getStatusIcon()}
              type="feather"
              size={80}
              color={this.getStatusColor()}
            />
          </View>

          <Text style={styles.title}>Bağlantı Durumu</Text>
          
          <View style={[styles.statusIndicator, { backgroundColor: this.getStatusColor() }]}>
            <Text style={styles.statusText}>
              {isConnected === null
                ? 'Kontrol Ediliyor...'
                : isConnected
                ? 'İnternet Bağlantısı Mevcut'
                : 'İnternet Bağlantısı Yok'}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>
              {isConnected === null
                ? 'Bağlantı durumu kontrol ediliyor...'
                : isConnected
                ? 'Cihazınız internete başarıyla bağlandı.'
                : 'Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'}
            </Text>
          </View>

          <Button
            title="Tekrar Kontrol Et"
            onPress={() => NetInfo.refresh()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            icon={{
              name: 'refresh',
              type: 'feather',
              size: 20,
              color: 'white',
            }}
          />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusIndicator: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 30,
  },
  detailsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
  },
});

export default Connectivity;