import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
interface ConnectivityState {
  isConnected: boolean | null;
}

class Connectivity extends React.Component<{}, ConnectivityState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isConnected: null,
    };
  }

  // Bağlantı durumu değişikliklerini dinlemek için abonelik
  componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  // Komponent kaldırıldığında aboneliği temizle
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // Bağlantı durumu değiştiğinde çağrılır
  handleConnectivityChange = (state: NetInfoState) => {
    const isConnected = state.isConnected;
    this.setState({ isConnected });

    if (isConnected === false) {
      Alert.alert('Bağlantı Hatası', 'Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  unsubscribe?: () => void;

  render() {
    const { isConnected } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {isConnected === null
            ? 'Bağlantı durumu kontrol ediliyor...'
            : isConnected
            ? 'İnternet bağlantısı mevcut!'
            : 'Bağlantı yok!'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Connectivity;
 