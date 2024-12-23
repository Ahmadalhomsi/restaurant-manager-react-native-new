import api from "./api";

// Hello World Fonksiyonu
export const getHelloWorld = async () => {
  try {
    const response = await api.get(`/testhello`);
    return response.data;
  } catch (error) {
    console.error("Error fetching hello world:", error);
    return null;
  }
};

// Products Fonksiyonları

// `getAllProducts` tüm ürünleri veritabanından getirir.
export const getAllProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return null;
  }
};

// `getProductById` belirli bir ürünün kimliğine göre getirir.
// @param {number} id - Ürünün benzersiz kimliği
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
};

// `createProduct` veritabanına yeni bir ürün ekler.
// @param {object} product - Oluşturulacak ürün
// @param {string} product.name - Ürünün adı
// @param {number} product.price - Ürünün fiyatı
export const createProduct = async (product) => {
  try {
    const response = await api.post("/products", product);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

// `updateProduct` belirli bir kimliğe sahip ürünü günceller.
// @param {number} id - Ürünün benzersiz kimliği
// @param {object} updatedProduct - Güncellenmiş ürün bilgileri
// @param {string} [updatedProduct.name] - Güncellenmiş ürün adı
// @param {number} [updatedProduct.price] - Güncellenmiş ürün fiyatı
export const updateProduct = async (id, updatedProduct) => {
  try {
    const response = await api.put(`/products/${id}`, updatedProduct);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    return null;
  }
};

// `deleteProduct` belirli bir kimliğe sahip ürünü siler.
// @param {number} id - Ürünün benzersiz kimliği
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    return null;
  }
};

// Customers Fonksiyonları

// `getAllCustomers` tüm müşterileri veritabanından getirir.
export const getAllCustomers = async () => {
  try {
    const response = await api.get("/customers");
    return response.data;
  } catch (error) {
    console.error("Error fetching all customers:", error);
    return null;
  }
};

// `getCustomerById` belirli bir müşteriyi kimliğine göre getirir.
// @param {number} id - Müşterinin benzersiz kimliği
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer with id ${id}:`, error);
    return null;
  }
};

// `createCustomer` veritabanına yeni bir müşteri ekler.
// @param {object} customer - Oluşturulacak müşteri
// @param {string} customer.username - Müşterinin kullanıcı adı
// @param {string} customer.password - Müşterinin şifresi
// @param {string} customer.role - Müşterinin rolü ("Müşteri" veya "Admin")
export const createCustomer = async (customer) => {
  try {
    const response = await api.post("/customers", customer);
    return response.data;
  } catch (error) {
    console.error("Error creating customer:", error);
    return null;
  }
};

// `updateCustomer` belirli bir müşteriyi günceller.
// @param {number} id - Müşterinin benzersiz kimliği
// @param {object} updatedCustomer - Güncellenmiş müşteri bilgileri
// @param {string} [updatedCustomer.username] - Güncellenmiş kullanıcı adı
// @param {string} [updatedCustomer.password] - Güncellenmiş şifre
// @param {string} [updatedCustomer.role] - Güncellenmiş rol ("Müşteri" veya "Admin")
export const updateCustomer = async (id, updatedCustomer) => {
  try {
    const response = await api.put(`/customers/${id}`, updatedCustomer);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    return null;
  }
};

// `deleteCustomer` belirli bir müşteriyi veritabanından siler.
// @param {number} id - Müşterinin benzersiz kimliği
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting customer with id ${id}:`, error);
    return null;
  }
};

// Orders Fonksiyonları

// `getAllOrders` tüm siparişleri getirir.
export const getAllOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return null;
  }
};

// `getOrderById` belirli bir siparişi kimliğine göre getirir.
// @param {number} id - Siparişin benzersiz kimliği
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    return null;
  }
};

// `createOrder` yeni bir sipariş oluşturur.
// @param {object} order - Oluşturulacak sipariş
// @param {number} order.customer_id - Siparişi veren müşterinin kimliği
// @param {number} order.table_number - Siparişin masa numarası
// @param {boolean} [order.is_confirmed] - Siparişin onay durumu
export const createOrder = async (order) => {
  try {
    const response = await api.post("/orders", order);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

// `updateOrder` mevcut bir siparişi günceller.
// @param {number} id - Siparişin benzersiz kimliği
// @param {object} updatedOrder - Güncellenmiş sipariş bilgileri
// @param {number} [updatedOrder.customer_id] - Güncellenmiş müşteri kimliği
// @param {number} [updatedOrder.table_number] - Güncellenmiş masa numarası
// @param {boolean} [updatedOrder.is_confirmed] - Güncellenmiş onay durumu
export const updateOrder = async (id, updatedOrder) => {
  try {
    const response = await api.put(`/orders/${id}`, updatedOrder);
    return response.data;
  } catch (error) {
    console.error(`Error updating order with id ${id}:`, error);
    return null;
  }
};

// `deleteOrder` belirli bir siparişi veritabanından siler.
// @param {number} id - Siparişin benzersiz kimliği
export const deleteOrder = async (id) => {
  try {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order with id ${id}:`, error);
    return null;
  }
};

// OrderDetails Fonksiyonları

// `getAllOrderDetails` tüm sipariş detaylarını getirir.
export const getAllOrderDetails = async () => {
  try {
    const response = await api.get("/order-details");
    return response.data;
  } catch (error) {
    console.error("Error fetching all order details:", error);
    return null;
  }
};

// `getOrderDetailById` belirli bir sipariş detayını kimliğine göre getirir.
// @param {number} id - Sipariş detayının benzersiz kimliği
export const getOrderDetailById = async (id) => {
  try {
    const response = await api.get(`/order-details/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order detail with id ${id}:`, error);
    return null;
  }
};

// `createOrderDetail` yeni bir sipariş detayı oluşturur.
// @param {object} orderDetail - Oluşturulacak sipariş detayı
// @param {number} orderDetail.order_id - İlgili siparişin kimliği
// @param {number} orderDetail.product_id - Siparişteki ürünün kimliği
// @param {number} orderDetail.quantity - Sipariş edilen ürün miktarı
export const createOrderDetail = async (orderDetail) => {
  try {
    const response = await api.post("/order-details", orderDetail);
    return response.data;
  } catch (error) {
    console.error("Error creating order detail:", error);
    return null;
  }
};

// `updateOrderDetail` mevcut bir sipariş detayını günceller.
// @param {number} id - Sipariş detayının benzersiz kimliği
// @param {object} updatedOrderDetail - Güncellenmiş sipariş detayı bilgileri
// @param {number} [updatedOrderDetail.order_id] - Güncellenmiş sipariş kimliği
// @param {number} [updatedOrderDetail.product_id] - Güncellenmiş ürün kimliği
// @param {number} [updatedOrderDetail.quantity] - Güncellenmiş miktar
export const updateOrderDetail = async (id, updatedOrderDetail) => {
  try {
    const response = await api.put(`/order-details/${id}`, updatedOrderDetail);
    return response.data;
  } catch (error) {
    console.error(`Error updating order detail with id ${id}:`, error);
    return null;
  }
};

// `deleteOrderDetail` belirli bir sipariş detayını siler.
// @param {number} id - Sipariş detayının benzersiz kimliği
export const deleteOrderDetail = async (id) => {
  try {
    const response = await api.delete(`/order-details/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order detail with id ${id}:`, error);
    return null;
  }
};

// Belirli bir siparişe ait tüm sipariş detaylarını getirir.
// @param {number} orderId - Siparişin benzersiz kimliği
// @returns {object|null} Sipariş detaylarını içeren nesne ya da hata durumunda null
export const getOrderDetailsByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/order-details`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching order details for order id ${orderId}:`,
      error
    );
    return null;
  }
};
