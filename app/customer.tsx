import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Button, Header, Icon } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import api from '@/utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderItem extends Product {
  quantity: number;
}

const CustomerOrderUI = () => {
  const [menu, setMenu] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    loadMenu();
    loadCustomerId();
  }, []);

  const loadCustomerId = async () => {
    const id = await AsyncStorage.getItem('customerId');
    setCustomerId(id);
  };

  const loadMenu = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu');
      setMenu(response.data);
    } catch {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToOrder = (item: Product) => {
    setOrder(prev => {
      const existingItem = prev.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prev.map(orderItem =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromOrder = (item: OrderItem) => {
    setOrder(prev => {
      const existingItem = prev.find(orderItem => orderItem.id === item.id);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(orderItem =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity - 1 } : orderItem
        );
      }
      return prev.filter(orderItem => orderItem.id !== item.id);
    });
  };

  const handlePlaceOrder = async () => {
    if (!customerId) {
      setError('Customer ID not found');
      return;
    }

    setLoading(true);
    try {
      const orderData = { customer_id: customerId, table_number: tableNumber, is_confirmed: false };
      const orderResponse = await api.post('/orders', orderData);
      const orderId = orderResponse.data.id;

      const orderDetailPromises = order.map(item => {
        return api.post('/order-details', { order_id: orderId, product_id: item.id, quantity: item.quantity });
      });

      await Promise.all(orderDetailPromises);
      setOrder([]);
      setTableNumber('');
      alert('Order placed successfully!');
    } catch {
      setError('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const triggerNotification = async () => {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      await api.post('/send-notification', { pushToken: token.data, title: 'New Order', body: 'You have a new order!' });
    } catch {
      console.error('Error sending notification');
    }
  };

  if (loading && menu.length === 0) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      <Header
        leftComponent={<Icon name="menu" color="#fff" />}
        centerComponent={{ text: 'Place Order', style: styles.headerTitle }}
        rightComponent={<Icon name="shopping-cart" color="#fff" />}
      />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={loadMenu} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={menu}
            renderItem={({ item }) => (
              <View style={styles.menuItem}>
                <Text>{item.name} - {item.price} TL</Text>
                <Button title="Add" onPress={() => handleAddToOrder(item)} />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <TextInput
            style={styles.input}
            placeholder="Table number"
            value={tableNumber}
            onChangeText={setTableNumber}
            keyboardType="numeric"
          />
          <FlatList
            data={order}
            renderItem={({ item }) => (
              <View style={styles.orderItem}>
                <Text>{item.name} x {item.quantity}</Text>
                <Button title="Remove" onPress={() => handleRemoveFromOrder(item)} />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <Button
            title={loading ? 'Placing Order...' : 'Place Order'}
            onPress={handlePlaceOrder}
            disabled={loading || order.length === 0 || !tableNumber}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorContainer: { alignItems: 'center', marginTop: 20 },
  errorText: { color: 'red' },
  contentContainer: { marginTop: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 20 },
});

export default CustomerOrderUI;
