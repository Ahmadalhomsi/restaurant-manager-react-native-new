import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, Alert } from 'react-native';
import { Button, Header, Icon, Tab, TabView } from '@rneui/themed';
import * as Utils from "../utils/index";

// Separate MenuTab component
const MenuTab = ({ products, onAddProduct, onDeleteProduct }: any) => {
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const product = {
      name: newProduct.name,
      price: Number(newProduct.price),
    };

    await onAddProduct(product);
    setNewProduct({ name: '', price: '' });
  };

  return (
    <View style={styles.menuContainer}>
      <View style={styles.addProductForm}>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={newProduct.name}
          onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={newProduct.price}
          onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: text }))}
          keyboardType="numeric"
        />
        <Button
          title="Add Product"
          onPress={handleAddProduct}
          buttonStyle={styles.addButton}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
            </View>
            <Button
              icon={<Icon name="delete" color="red" />}
              type="clear"
              onPress={() => onDeleteProduct(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
};

// Separate OrdersTab component
const OrdersTab = ({ orders, onOrderStatus }: any) => (
  <FlatList
    data={orders}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.orderContainer}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>Table {item.table_number}</Text>
          <Text style={styles.orderItems}>
            {item.items?.join(', ')}
          </Text>
          <Text style={styles.orderStatus}>
            Status: {item.is_confirmed ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
        <View style={styles.orderActions}>
          <Button
            title="Approve"
            type="outline"
            buttonStyle={[styles.button, item.is_confirmed && styles.disabledButton]}
            onPress={() => onOrderStatus(item.id, true)}
            disabled={Boolean(item.is_confirmed)}
          />
          <Button
            title="Reject"
            type="outline"
            buttonStyle={[styles.button, item.is_confirmed === false && styles.disabledButton]}
            onPress={() => onOrderStatus(item.id, false)}
            disabled={item.is_confirmed === false}
          />
        </View>
      </View>
    )}
  />
);

const RestaurantManagement = () => {
  const [orders, setOrders] = useState<any>([]);
  const [products, setProducts] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    const fetchedOrders = await Utils.getAllOrders();
    if (fetchedOrders) {
      setOrders(fetchedOrders);
    }
  };

  const fetchProducts = async () => {
    const fetchedProducts = await Utils.getAllProducts();
    if (fetchedProducts) {
      setProducts(fetchedProducts);
    }
  };

  const handleOrderStatus = async (orderId: any, status: boolean) => {
    try {
      // Call the updateOrder function with the new status
      const response = await Utils.updateOrder(orderId, {
        is_confirmed: status
      });

      if (response) {
        // Update local state only if the API call was successful
        const updatedOrders = orders.map((order: any) =>
          order.id === orderId ? { ...order, is_confirmed: status } : order
        );
        setOrders(updatedOrders);
        
        // Show success message
        Alert.alert(
          'Success',
          `Order ${status ? 'approved' : 'rejected'} successfully`
        );
      } else {
        // Show error message if the API call failed
        Alert.alert(
          'Error',
          `Failed to ${status ? 'approve' : 'reject'} order. Please try again.`
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert(
        'Error',
        'An error occurred while updating the order status'
      );
    }
  };

  const handleAddProduct = async (product: any) => {
    const response = await Utils.createProduct(product);
    if (response) {
      fetchProducts();
      Alert.alert('Success', 'Product added successfully');
    }
  };

  const handleDeleteProduct = async (id: any) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await Utils.deleteProduct(id);
            if (response) {
              fetchProducts();
              Alert.alert('Success', 'Product deleted successfully');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        leftComponent={<Icon name="menu" color="#fff" />}
        centerComponent={{ text: 'Restaurant Management', style: styles.headerTitle }}
        rightComponent={<Icon name="refresh" color="#fff" onPress={() => {
          fetchOrders();
          fetchProducts();
        }} />}
        containerStyle={styles.header}
      />

      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={{ backgroundColor: '#007bff' }}
      >
        <Tab.Item title="Orders" />
        <Tab.Item title="Menu" />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={styles.tabContent}>
          <OrdersTab 
            orders={orders} 
            onOrderStatus={handleOrderStatus}
          />
        </TabView.Item>
        <TabView.Item style={styles.tabContent}>
          <MenuTab 
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </TabView.Item>
      </TabView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 4,
  },
  orderActions: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  menuContainer: {
    flex: 1,
  },
  addProductForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007bff',
    marginTop: 8,
  },
  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default RestaurantManagement;