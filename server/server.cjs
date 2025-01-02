// server.cjs

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const { Expo } = require('expo-server-sdk');


const PORT = 3000;

app.use(express.json());


// Notification
const expo = new Expo({ projectId: '0c7bd349-db31-4d3f-b2e3-770abfd4f89d' });

app.post('/send-notification', async (req, res) => {
  console.log('====================================');
  console.log('Notification Request');
  console.log('====================================');
  const { pushToken, title, body, data } = req.body;

  if (!Expo.isExpoPushToken(pushToken)) {
    return res.status(400).send({ error: 'Invalid Expo Push Token' });
  }

  const messages = [
    {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    },
  ];

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log(ticketChunk);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to send notification' });
  }
});

//! SQL VERİTABANI OLUŞTURMA.

// SQLite veritabanı yolunu belirleme
const dbPath = path.resolve(__dirname, "database.sqlite");

// SQLite veritabanına bağlanma
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Veritabanına bağlanırken hata oluştu:", err.message);
  } else {
    console.log("SQLite veritabanına bağlanıldı.");
  }
});

// Tabloların oluşturulması
db.serialize(() => {
  // Ürünler Tablosu
  db.run(
    `
    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL
    )
  `,
    (err) => {
      if (err) {
        console.error("Products tablosu oluşturulurken hata:", err.message);
      } else {
        console.log("Products tablosu hazır.");
      }
    }
  );

  // Müşteri Tablosu
  db.run(
    `
  CREATE TABLE IF NOT EXISTS Customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('Müşteri', 'Admin')) NOT NULL
  )
  `,
    (err) => {
      if (err) {
        console.error("Customers tablosu oluşturulurken hata:", err.message);
      } else {
        console.log("Customers tablosu hazır.");
      }
    }
  );

  // Sipariş Tablosu
  db.run(
    `
    CREATE TABLE IF NOT EXISTS Orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      table_number INTEGER NOT NULL,
      is_confirmed BOOLEAN DEFAULT 0,
      FOREIGN KEY (customer_id) REFERENCES Customers(id)
    )
  `,
    (err) => {
      if (err) {
        console.error("Orders tablosu oluşturulurken hata:", err.message);
      } else {
        console.log("Orders tablosu hazır.");
      }
    }
  );

  // Sipariş Detay Tablosu
  db.run(
    `
    CREATE TABLE IF NOT EXISTS OrderDetails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES Orders(id),
      FOREIGN KEY (product_id) REFERENCES Products(id)
    )
  `,
    (err) => {
      if (err) {
        console.error("OrderDetails tablosu oluşturulurken hata:", err.message);
      } else {
        console.log("OrderDetails tablosu hazır.");
      }
    }
  );
});

//! Products Endpoint'leri

// Tüm ürünleri listele
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM Products";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Belirli bir ürünü getir
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Products WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Ürün bulunamadı" });
    }
  });
});

// Yeni bir ürün oluştur
app.post("/products", (req, res) => {
  const { name, price } = req.body;
  const sql = "INSERT INTO Products (name, price) VALUES (?, ?)";
  db.run(sql, [name, price], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name, price });
  });
});

// Mevcut bir ürünü güncelle
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const sql = "UPDATE Products SET name = ?, price = ? WHERE id = ?";
  db.run(sql, [name, price, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Ürün bulunamadı" });
    } else {
      res.json({ id, name, price });
    }
  });
});

// Bir ürünü sil
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Products WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Ürün bulunamadı" });
    } else {
      res.json({ message: "Ürün silindi" });
    }
  });
});

//! MÜŞTERİ ENDPOINTLERİ

// Tüm Müşterileri Listele
app.get("/customers", (req, res) => {
  const sql = "SELECT * FROM Customers";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Belirli Bir Müşteriyi Getir
app.get("/customers/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Customers WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Müşteri bulunamadı" });
    }
  });
});

// Yeni Bir Müşteri Oluştur
app.post("/customers", (req, res) => {
  const { username, password, role } = req.body;
  const sql =
    "INSERT INTO Customers (username, password, role) VALUES (?, ?, ?)";
  db.run(sql, [username, password, role], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Kullanıcı adı zaten alınmış" });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.status(201).json({ id: this.lastID, username, password, role });
  });
});

// Mevcut Bir Müşteriyi Güncelle
// Mevcut Bir Müşteriyi Güncelle
app.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  if (!username && !password && !role) {
    res.status(400).json({ message: "Güncellenecek alan yok" });
    return;
  }

  let sql = "UPDATE Customers SET ";
  const params = [];

  if (username) {
    sql += "username = ?, ";
    params.push(username);
  }

  if (password) {
    sql += "password = ?, ";
    params.push(password);
  }

  if (role) {
    sql += "role = ?, ";
    params.push(role);
  }

  // Son virgülü kaldır ve WHERE ekle
  sql = sql.slice(0, -2) + " WHERE id = ?";
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Müşteri bulunamadı" });
    } else {
      res.json({ message: "Müşteri güncellendi" });
    }
  });
});

// Müşteriyi Sil
app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Customers WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Müşteri bulunamadı" });
    } else {
      res.json({ message: "Müşteri silindi" });
    }
  });
});

//! Sipariş endpointleri

// Tüm siparişleri listele
app.get("/orders", (req, res) => {
  const sql = `
    SELECT Orders.id, Orders.customer_id, Customers.username, Orders.table_number, Orders.is_confirmed
    FROM Orders
    JOIN Customers ON Orders.customer_id = Customers.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Tüm siparişleri müşteri kimliğine göre getir
app.get("/orders/by-customer/:customerId", (req, res) => {
  const { customerId } = req.params;
  const sql = `
    SELECT Orders.id, Orders.customer_id, Customers.username, Orders.table_number, Orders.is_confirmed
    FROM Orders
    JOIN Customers ON Orders.customer_id = Customers.id
    WHERE Orders.customer_id = ?
  `;
  db.all(sql, [customerId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Belirli bir siparişi getir
app.get("/orders/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT Orders.id, Orders.customer_id, Customers.username, Orders.table_number, Orders.is_confirmed
    FROM Orders
    JOIN Customers ON Orders.customer_id = Customers.id
    WHERE Orders.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Sipariş bulunamadı" });
    }
  });
});

// Yeni bir sipariş oluştur
app.post("/orders", (req, res) => {
  const { customer_id, table_number, is_confirmed } = req.body;
  const sql =
    "INSERT INTO Orders (customer_id, table_number, is_confirmed) VALUES (?, ?, ?)";
  db.run(
    sql,
    [customer_id, table_number, is_confirmed ? 1 : 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res
        .status(201)
        .json({ id: this.lastID, customer_id, table_number, is_confirmed });
    }
  );
});

// Siparişi güncelle
app.put("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { customer_id, table_number, is_confirmed } = req.body;

  let sql = "UPDATE Orders SET ";
  const params = [];

  if (customer_id !== undefined) {
    sql += "customer_id = ?, ";
    params.push(customer_id);
  }

  if (table_number !== undefined) {
    sql += "table_number = ?, ";
    params.push(table_number);
  }

  if (is_confirmed !== undefined) {
    sql += "is_confirmed = ?, ";
    params.push(is_confirmed ? 1 : 0);
  }

  if (params.length === 0) {
    res.status(400).json({ message: "Güncellenecek alan yok" });
    return;
  }

  // Son virgülü kaldır ve WHERE ekle
  sql = sql.slice(0, -2) + " WHERE id = ?";
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Sipariş bulunamadı" });
    } else {
      res.json({ message: "Sipariş güncellendi" });
    }
  });
});

// Siparişi sil
app.delete("/orders/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Orders WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Sipariş bulunamadı" });
    } else {
      res.json({ message: "Sipariş silindi" });
    }
  });
});

// Belirli bir siparişin sipariş detaylarını getir
app.get("/orders/:id/order-details", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      OrderDetails.id, 
      OrderDetails.order_id, 
      Orders.table_number, 
      OrderDetails.product_id, 
      Products.name AS product_name, 
      OrderDetails.quantity
    FROM 
      OrderDetails
    JOIN 
      Orders ON OrderDetails.order_id = Orders.id
    JOIN 
      Products ON OrderDetails.product_id = Products.id
    WHERE 
      OrderDetails.order_id = ?
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

//! SİPARİŞ DETAY ENDPOINTLERİ

// OrderDetails Endpoint'leri

// Tüm sipariş detaylarını listele
app.get("/order-details", (req, res) => {
  const sql = `
    SELECT OrderDetails.id, OrderDetails.order_id, Orders.table_number, OrderDetails.product_id, Products.name as product_name, OrderDetails.quantity
    FROM OrderDetails
    JOIN Orders ON OrderDetails.order_id = Orders.id
    JOIN Products ON OrderDetails.product_id = Products.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Belirli bir sipariş detayını getir
app.get("/order-details/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT OrderDetails.id, OrderDetails.order_id, Orders.table_number, OrderDetails.product_id, Products.name as product_name, OrderDetails.quantity
    FROM OrderDetails
    JOIN Orders ON OrderDetails.order_id = Orders.id
    JOIN Products ON OrderDetails.product_id = Products.id
    WHERE OrderDetails.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Sipariş detayı bulunamadı" });
    }
  });
});

// Yeni bir sipariş detayı oluştur
app.post("/order-details", (req, res) => {
  const { order_id, product_id, quantity } = req.body;
  const sql =
    "INSERT INTO OrderDetails (order_id, product_id, quantity) VALUES (?, ?, ?)";
  db.run(sql, [order_id, product_id, quantity], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, order_id, product_id, quantity });
  });
});

// Sipariş detayını güncelle
app.put("/order-details/:id", (req, res) => {
  const { id } = req.params;
  const { order_id, product_id, quantity } = req.body;

  let sql = "UPDATE OrderDetails SET ";
  const params = [];

  if (order_id !== undefined) {
    sql += "order_id = ?, ";
    params.push(order_id);
  }

  if (product_id !== undefined) {
    sql += "product_id = ?, ";
    params.push(product_id);
  }

  if (quantity !== undefined) {
    sql += "quantity = ?, ";
    params.push(quantity);
  }

  if (params.length === 0) {
    res.status(400).json({ message: "Güncellenecek alan yok" });
    return;
  }

  // Son virgülü kaldır ve WHERE ekle
  sql = sql.slice(0, -2) + " WHERE id = ?";
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Sipariş detayı bulunamadı" });
    } else {
      res.json({ message: "Sipariş detayı güncellendi" });
    }
  });
});

// Sipariş detayını sil
app.delete("/order-details/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM OrderDetails WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Sipariş detayı bulunamadı" });
    } else {
      res.json({ message: "Sipariş detayı silindi" });
    }
  });
});

// Test Endpoint
app.get("/testhello", (req, res) => {
  res.send("Local Sunucu Aktif");
});

// Sunucuyu Dinlemeye Başlama
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

/* //! TAMAMEN ÖRNEK AMAÇLI CMD KOMUTLARI, WİNDOWS > CMD PANELİNDE KOPYALAYIP DENEYEBİLİRSİNİZ

curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d "{\"name\": \"Örnek Ürün 1\", \"price\": 100}"
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d "{\"name\": \"Örnek Ürün 2\", \"price\": 200}"

curl -X POST http://localhost:3000/customers -H "Content-Type: application/json" -d "{\"username\": \"kullanici1\", \"password\": \"sifre123\", \"role\": \"Müşteri\"}"
curl -X POST http://localhost:3000/customers -H "Content-Type: application/json" -d "{\"username\": \"kullanici2\", \"password\": \"sifre456\", \"role\": \"Admin\"}"

curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d "{\"customer_id\": 1, \"table_number\": 5, \"is_confirmed\": true}"
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d "{\"customer_id\": 2, \"table_number\": 10, \"is_confirmed\": false}"

curl -X POST http://localhost:3000/order-details -H "Content-Type: application/json" -d "{\"order_id\": 1, \"product_id\": 1, \"quantity\": 2}"
curl -X POST http://localhost:3000/order-details -H "Content-Type: application/json" -d "{\"order_id\": 2, \"product_id\": 2, \"quantity\": 5}"

curl -X GET http://localhost:3000/products/1
curl -X GET http://localhost:3000/customers/1
curl -X GET http://localhost:3000/orders/1
curl -X GET http://localhost:3000/order-details/1

curl -X GET http://localhost:3000/products
curl -X GET http://localhost:3000/customers
curl -X GET http://localhost:3000/orders
curl -X GET http://localhost:3000/order-details

curl -X DELETE http://localhost:3000/order-details/1
curl -X DELETE http://localhost:3000/order-details/2

curl -X DELETE http://localhost:3000/orders/1
curl -X DELETE http://localhost:3000/orders/2

curl -X DELETE http://localhost:3000/products/1
curl -X DELETE http://localhost:3000/products/2

curl -X DELETE http://localhost:3000/customers/1
curl -X DELETE http://localhost:3000/customers/2

*/
