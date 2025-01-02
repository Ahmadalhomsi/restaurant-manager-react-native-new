import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Button, Header, Icon } from '@rneui/themed';
import * as Utils from "../utils/index";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import api from '@/utils/api';
import { router } from "expo-router";


interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderItem extends Product {
  quantity: number;
}

export const getPushToken = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
};

const CustomerOrderUI = () => {
  const [menu, setMenu] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
    loadCustomerId();
  }, []);

  const loadCustomerId = async () => {
    try {
      const id = await AsyncStorage.getItem('customerId');
      setCustomerId(id);
    } catch (err) {
      console.error('Error loading customer ID:', err);
    }
  };

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const products = await Utils.getAllProducts();
      if (products) {
        setMenu(products);
      } else {
        setError('Menü yüklenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Menü yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToProfile = () => {
    router.push("/profile");
  }

  const navigateToLocation = () => {
    router.push("/location");
  }


  const handleAddToOrder = (item: Product) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...prevOrder, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromOrder = (item: OrderItem) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
      if (existingItem && existingItem.quantity > 1) {
        return prevOrder.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem
        );
      }
      return prevOrder.filter(orderItem => orderItem.id !== item.id);
    });
  };


  const formatOrderForNotification = (order: OrderItem[]): string => {
    const orderSummary = order
      .map(item => `${item.name} (${item.quantity}x) - ${(item.price * item.quantity).toFixed(2)} TL`)
      .join('\n');
  
    const totalAmount = order
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
      .toFixed(2);
  
    return `Yeni Sipariş Detayları:\n\n${orderSummary}\n\nToplam: ${totalAmount} TL`;
  };
  
  const triggerNotification = async () => {
    try {
      console.log('Sending notification...');
      const token = await getPushToken();
      console.log('Push Token:', token);
  
      const notificationData = {
        pushToken: token,
        title: 'Yeni Sipariş Alındı',
        body: formatOrderForNotification(order),
        data: {
          orderId: 123,
          orderDetails: {
            items: order.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity
            })),
            totalAmount: order.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString()
          }
        },
      };
  
      const response = await api.post('/send-notification', notificationData);
      console.log("Notification Response:", response);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerId) {
      setError('Müşteri kimliği bulunamadı');
      return;
    }

    setLoading(true);
    try {
      // Create the order using Utils.createOrder
      const orderData = {
        customer_id: parseInt(customerId),
        table_number: parseInt(tableNumber),
        is_confirmed: false
      };

      console.log('Sending order data:', orderData);
      const newOrder = await Utils.createOrder(orderData);

      if (!newOrder) {
        throw new Error('Sipariş oluşturulamadı');
      }

      console.log('Order created:', newOrder);

      triggerNotification();

      // Create order details for each item using Utils.createOrderDetail
      const orderDetailPromises = order.map(item => {
        const detailData = {
          order_id: newOrder.id,
          product_id: item.id,
          quantity: item.quantity
        };
        console.log('Sending order detail:', detailData);
        return Utils.createOrderDetail(detailData);
      });

      const orderDetails = await Promise.all(orderDetailPromises);

      if (orderDetails.some(detail => detail === null)) {
        throw new Error('Bazı sipariş detayları oluşturulamadı');
      }

      // Clear order after successful submission
      setOrder([]);
      setTableNumber('');
      alert('Siparişiniz başarıyla alındı!');
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Sipariş gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  if (loading && menu.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        leftComponent={<Icon name="menu" color="#fff" />}
        centerComponent={{
          text: 'Sipariş Ver',
          style: styles.headerTitle,
        }}
        rightComponent={
          <View style={styles.cartIcon}>
            <Icon name="shopping-cart" color="#fff" />
            {order.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {order.reduce((sum, item) => sum + item.quantity, 0)}
                </Text>
              </View>
            )}
          </View>
        }
        containerStyle={styles.header}
      />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Tekrar Dene"
            type="outline"
            onPress={fetchMenu}
            buttonStyle={styles.retryButton}
          />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Menü</Text>
            <FlatList
              data={menu}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.menuItem}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemPrice}>
                    {item.price.toFixed(2)} TL
                  </Text>
                  <Button
                    title="Ekle"
                    type="outline"
                    buttonStyle={styles.button}
                    onPress={() => handleAddToOrder(item)}
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.orderContainer}>
            <Text style={styles.sectionTitle}>Siparişiniz</Text>
            <TextInput
              style={styles.tableInput}
              placeholder="Masa numarası giriniz"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="numeric"
            />
            <FlatList
              data={order}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.orderItem}>
                  <Text style={styles.orderItemName}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text style={styles.orderItemPrice}>
                    {(item.price * item.quantity).toFixed(2)} TL
                  </Text>
                  <Button
                    title="Çıkar"
                    type="outline"
                    buttonStyle={styles.button}
                    onPress={() => handleRemoveFromOrder(item)}
                  />
                </View>
              )}
              ListFooterComponent={() => (
                order.length > 0 ? (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      Toplam: {order.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} TL
                    </Text>
                  </View>
                ) : null
              )}
            />
            <Button
              title={loading ? 'Sipariş Gönderiliyor...' : 'Siparişi Gönder'}
              type="solid"
              buttonStyle={styles.placeOrderButton}
              onPress={handlePlaceOrder}
              disabled={loading || order.length === 0 || tableNumber.trim() === ''}
            />
          </View>
        </View>
      )}
      <Button
        title="Profil Fotoğrafı"
        onPress={navigateToProfile}
        type="outline"
        containerStyle={styles.buttonContainer}
        disabled={loading}
      />
      <Button
        title="Konum"
        onPress={navigateToLocation}
        type="outline"
        containerStyle={styles.buttonContainer}
        disabled={loading}
      />
      <Button
        title="Yemek Öner"
        // onPress={() => router.push("sc")}
        type="outline"
        containerStyle={styles.buttonContainer}
        disabled={loading}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007bff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ff4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemName: {
    flex: 1,
    fontSize: 14,
  },
  menuItemPrice: {
    fontSize: 14,
    marginHorizontal: 8,
    minWidth: 70,
    textAlign: 'right',
  },
  tableInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
  },
  orderItemPrice: {
    fontSize: 14,
    marginHorizontal: 8,
    minWidth: 70,
    textAlign: 'right',
  },
  button: {
    marginHorizontal: 4,
    minWidth: 80,
  },
  placeOrderButton: {
    marginTop: 12,
    backgroundColor: '#28a745',
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
});

export default CustomerOrderUI;