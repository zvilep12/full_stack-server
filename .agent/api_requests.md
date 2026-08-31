# Restaurant API Request Guide

This file contains sample HTTP requests (cURL, PowerShell, and HTTP Client format) for every endpoint in the restaurant management system.

**Base URL:** `http://localhost:3000`

---

## 1. Employees Module (`/employees`)

### Create Employee (Register)
* **HTTP:**
  ```http
  POST http://localhost:3000/employees HTTP/1.1
  Content-Type: application/json

  {
    "id": 101010,
    "name": "Waiter John",
    "email": "john@restaurant.com",
    "phone": "050-1111111",
    "role": "waiter"
  }
  ```
* **cURL:**
  ```bash
  curl -X POST http://localhost:3000/employees \
       -H "Content-Type: application/json" \
       -d '{"id": 101010, "name": "Waiter John", "email": "john@restaurant.com", "phone": "050-1111111", "role": "waiter"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/employees" -Method Post -ContentType "application/json" -Body '{"id": 101010, "name": "Waiter John", "email": "john@restaurant.com", "phone": "050-1111111", "role": "waiter"}'
  ```

### Get All Employees (with optional filters)
* **HTTP:**
  ```http
  GET http://localhost:3000/employees?role=waiter&isActive=true HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET "http://localhost:3000/employees?role=waiter&isActive=true"
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/employees?role=waiter&isActive=true" -Method Get
  ```

### Search Employees by Name
* **HTTP:**
  ```http
  GET http://localhost:3000/employees/name/John HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/employees/name/John
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/employees/name/John" -Method Get
  ```

### Get Employee by ID
* **HTTP:**
  ```http
  GET http://localhost:3000/employees/101010 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/employees/101010
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/employees/101010" -Method Get
  ```

### Update Employee
* **HTTP:**
  ```http
  PUT http://localhost:3000/employees/101010 HTTP/1.1
  Content-Type: application/json

  {
    "phone": "050-9999999",
    "isActive": true
  }
  ```
* **cURL:**
  ```bash
  curl -X PUT http://localhost:3000/employees/101010 \
       -H "Content-Type: application/json" \
       -d '{"phone": "050-9999999", "isActive": true}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/employees/101010" -Method Put -ContentType "application/json" -Body '{"phone": "050-9999999", "isActive": true}'
  ```

### Delete Employee
* **HTTP:**
  ```http
  DELETE http://localhost:3000/employees/101010 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/employees/101010
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/employees/101010" -Method Delete
  ```

---

## 2. Customers Module (`/customers`)

### Create Customer
* **HTTP:**
  ```http
  POST http://localhost:3000/customers HTTP/1.1
  Content-Type: application/json

  {
    "id": 202020,
    "name": "Alice Smith",
    "email": "alice@gmail.com",
    "phone": "054-2222222"
  }
  ```
* **cURL:**
  ```bash
  curl -X POST http://localhost:3000/customers \
       -H "Content-Type: application/json" \
       -d '{"id": 202020, "name": "Alice Smith", "email": "alice@gmail.com", "phone": "054-2222222"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/customers" -Method Post -ContentType "application/json" -Body '{"id": 202020, "name": "Alice Smith", "email": "alice@gmail.com", "phone": "054-2222222"}'
  ```

### Get All Customers
* **HTTP:**
  ```http
  GET http://localhost:3000/customers HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/customers
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/customers" -Method Get
  ```

### Search Customers by Name
* **HTTP:**
  ```http
  GET http://localhost:3000/customers/name/Alice HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/customers/name/Alice
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/customers/name/Alice" -Method Get
  ```

### Get Customer by ID (with Order history)
* **HTTP:**
  ```http
  GET http://localhost:3000/customers/202020 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/customers/202020
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/customers/202020" -Method Get
  ```

### Update Customer
* **HTTP:**
  ```http
  PUT http://localhost:3000/customers/202020 HTTP/1.1
  Content-Type: application/json

  {
    "name": "Alice S. Miller"
  }
  ```
* **cURL:**
  ```bash
  curl -X PUT http://localhost:3000/customers/202020 \
       -H "Content-Type: application/json" \
       -d '{"name": "Alice S. Miller"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/customers/202020" -Method Put -ContentType "application/json" -Body '{"name": "Alice S. Miller"}'
  ```

### Delete Customer
* **HTTP:**
  ```http
  DELETE http://localhost:3000/customers/202020 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/customers/202020
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/customers/202020" -Method Delete
  ```

---

## 3. Menu Items Module (`/menu`)

### Create Menu Item
* **HTTP:**
  ```http
  POST http://localhost:3000/menu HTTP/1.1
  Content-Type: application/json

  {
    "name": "Classic Burger",
    "price": 55,
    "category": "Mains",
    "description": "Juicy beef patty with lettuce and tomato"
  }
  ```
* **cURL:**
  ```bash
  curl -X POST http://localhost:3000/menu \
       -H "Content-Type: application/json" \
       -d '{"name": "Classic Burger", "price": 55, "category": "Mains", "description": "Juicy beef patty with lettuce and tomato"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/menu" -Method Post -ContentType "application/json" -Body '{"name": "Classic Burger", "price": 55, "category": "Mains", "description": "Juicy beef patty with lettuce and tomato"}'
  ```

### Get Menu Items (with optional filters)
* **HTTP:**
  ```http
  GET http://localhost:3000/menu?category=Mains&isAvailable=true HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET "http://localhost:3000/menu?category=Mains&isAvailable=true"
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/menu?category=Mains&isAvailable=true" -Method Get
  ```

### Search Menu Items by Name
* **HTTP:**
  ```http
  GET http://localhost:3000/menu/name/Burger HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/menu/name/Burger
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/menu/name/Burger" -Method Get
  ```

### Update Menu Item
* **HTTP:**
  ```http
  PUT http://localhost:3000/menu/1 HTTP/1.1
  Content-Type: application/json

  {
    "price": 58,
    "isAvailable": false
  }
  ```
* **cURL:**
  ```bash
  curl -X PUT http://localhost:3000/menu/1 \
       -H "Content-Type: application/json" \
       -d '{"price": 58, "isAvailable": false}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/menu/1" -Method Put -ContentType "application/json" -Body '{"price": 58, "isAvailable": false}'
  ```

### Delete Menu Item
* **HTTP:**
  ```http
  DELETE http://localhost:3000/menu/1 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/menu/1
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/menu/1" -Method Delete
  ```

---

## 4. Orders Module (`/orders`)

### Create Order (Open Order for Table)
* **HTTP:**
  ```http
  POST http://localhost:3000/orders HTTP/1.1
  Content-Type: application/json

  {
    "tableNumber": 8,
    "employeeId": 101010,
    "customerId": 202020,
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2,
        "notes": "no pickles"
      }
    ]
  }
  ```
* **cURL:**
  ```bash
  curl -X POST http://localhost:3000/orders \
       -H "Content-Type: application/json" \
       -d '{"tableNumber": 8, "employeeId": 101010, "customerId": 202020, "items": [{"menuItemId": 1, "quantity": 2, "notes": "no pickles"}]}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders" -Method Post -ContentType "application/json" -Body '{"tableNumber": 8, "employeeId": 101010, "customerId": 202020, "items": [{"menuItemId": 1, "quantity": 2, "notes": "no pickles"}]}'
  ```

### Get All Orders (with optional filters)
* **HTTP:**
  ```http
  GET http://localhost:3000/orders?status=received&tableNumber=8 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET "http://localhost:3000/orders?status=received&tableNumber=8"
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders?status=received&tableNumber=8" -Method Get
  ```

### Search Orders by Customer Name
* **HTTP:**
  ```http
  GET http://localhost:3000/orders/customer/name/Alice HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/orders/customer/name/Alice
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/customer/name/Alice" -Method Get
  ```

### Get Order by ID
* **HTTP:**
  ```http
  GET http://localhost:3000/orders/1 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X GET http://localhost:3000/orders/1
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/1" -Method Get
  ```

### Update Order Status
* **HTTP:**
  ```http
  PUT http://localhost:3000/orders/1 HTTP/1.1
  Content-Type: application/json

  {
    "status": "paid"
  }
  ```
* **cURL:**
  ```bash
  curl -X PUT http://localhost:3000/orders/1 \
       -H "Content-Type: application/json" \
       -d '{"status": "paid"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/1" -Method Put -ContentType "application/json" -Body '{"status": "paid"}'
  ```

### Delete Order
* **HTTP:**
  ```http
  DELETE http://localhost:3000/orders/1 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/orders/1
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/1" -Method Delete
  ```

---

## 5. Order Items Nested Endpoints (`/orders/:id/items`)

### Add Dish to Order (or increase quantity)
* **HTTP:**
  ```http
  POST http://localhost:3000/orders/1/items HTTP/1.1
  Content-Type: application/json

  {
    "menuItemId": 2,
    "quantity": 1,
    "notes": "extra ice"
  }
  ```
* **cURL:**
  ```bash
  curl -X POST http://localhost:3000/orders/1/items \
       -H "Content-Type: application/json" \
       -d '{"menuItemId": 2, "quantity": 1, "notes": "extra ice"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/1/items" -Method Post -ContentType "application/json" -Body '{"menuItemId": 2, "quantity": 1, "notes": "extra ice"}'
  ```

### Update Dish in Order (quantity or notes)
* **HTTP:**
  ```http
  PUT http://localhost:3000/orders/1/items/2 HTTP/1.1
  Content-Type: application/json

  {
    "quantity": 3,
    "notes": "no lemon"
  }
  ```
* **cURL:**
  ```bash
  curl -X PUT http://localhost:3000/orders/1/items/2 \
       -H "Content-Type: application/json" \
       -d '{"quantity": 3, "notes": "no lemon"}'
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/1/items/2" -Method Put -ContentType "application/json" -Body '{"quantity": 3, "notes": "no lemon"}'
  ```

### Remove Dish from Order
* **HTTP:**
  ```http
  DELETE http://localhost:3000/orders/1/items/2 HTTP/1.1
  ```
* **cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/orders/1/items/2
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/orders/1/items/2" -Method Delete
  ```
