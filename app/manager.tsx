import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, Alert } from 'react-native';
import { Button, Tab, TabView } from '@rneui/themed';
import * as Utils from "../utils/index";

const MenuTab = ({ products, onAddProduct, onDeleteProduct }: any) => {
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    onAddProduct({ ...newProduct, price: Number(newProduct.price) });
    setNewProduct({ name: '', price: '' });
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={newProduct.name}
        onChangeText={(name) => setNewProduct({ ...newProduct, name })}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={newProduct.price}
        onChangeText={(price) => setNewProduct({ ...newProduct, price })}
        keyboardType="numeric"
      />
      <Button title="Add Product" onPress={handleAddProduct} />
      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name} - ${item.price}</Text>
            <Button title="Delete" onPress={() => onDeleteProduct(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const OrdersTab = ({ orders, onUpdateOrder }: any) => (
  <FlatList
    data={orders}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.item}>
        <Text>Table {item.table_number}: {item.is_confirmed ? 'Confirmed' : 'Pending'}</Text>
        <Button title="Approve" onPress={() => onUpdateOrder(item.id, true)} />
        <Button title="Reject" onPress={() => onUpdateOrder(item.id, false)} />
      </View>
    )}
  />
);

const RestaurantManagement = () => {
  const [index, setIndex] = useState(0);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Utils.getAllOrders().then(setOrders);
    Utils.getAllProducts().then(setProducts);
  }, []);

  const handleAddProduct = (product: any) => {
    Utils.createProduct(product).then(() => Utils.getAllProducts().then(setProducts));
  };

  const handleDeleteProduct = (id: any) => {
    Utils.deleteProduct(id).then(() => Utils.getAllProducts().then(setProducts));
  };

  const handleUpdateOrder = (id: any, status: boolean) => {
    Utils.updateOrder(id, { is_confirmed: status }).then(() =>
      Utils.getAllOrders().then(setOrders)
    );
  };

  return (
    <View style={styles.container}>
      <Tab value={index} onChange={setIndex}>
        <Tab.Item title="Orders" />
        <Tab.Item title="Menu" />
      </Tab>
      <TabView value={index} onChange={setIndex}>
        <TabView.Item>
          <OrdersTab orders={orders} onUpdateOrder={handleUpdateOrder} />
        </TabView.Item>
        <TabView.Item>
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
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});

export default RestaurantManagement;
