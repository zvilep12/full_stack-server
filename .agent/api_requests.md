# Restaurant API Reference (Thunder Client / REST Client Guide)

This guide documents all available API endpoints, their HTTP methods, required headers, URL parameters, and JSON request bodies. Use this reference to set up your requests in Thunder Client.

**Base URL:** `http://localhost:3000`  
**Default Header for all POST/PUT requests:** `Content-Type: application/json`

---

## 1. Employees Module (`/employees`)

### Create Employee (Register)
* **Method:** `POST`
* **Path:** `/employees`
* **Description:** Transactionally creates a new person and registers them as an employee.
* **Body (JSON):**
  ```json
  {
    "id": 101010,            // Integer (Required) - National Identity Number
    "name": "Waiter John",   // String (Required) - Full name
    "email": "john@test.com",// String (Required) - Unique email address
    "phone": "050-1111111",  // String (Optional) - Phone number
    "role": "waiter",        // String (Optional) - e.g., "waiter", "chef", "manager"
    "managerId": null        // Integer (Optional) - ID of supervisor employee (or null)
  }
  ```

### Get All Employees
* **Method:** `GET`
* **Path:** `/employees`
* **Description:** Retrieves all employees.
* **Query Parameters (Optional):**
  * `role` (e.g. `?role=waiter`) - Filter by employee role.
  * `isActive` (e.g. `?isActive=true` or `?isActive=false`) - Filter by active status.

### Search Employees by Name
* **Method:** `GET`
* **Path:** `/employees/name/:name`
* **Description:** Case-insensitive partial matching search for employees.
* **Path Parameter:**
  * `:name` (e.g. `/employees/name/john`) - The search term.

### Get Employee by ID
* **Method:** `GET`
* **Path:** `/employees/:id`
* **Description:** Retrieves an employee's profile, including their subordinates (if manager) and direct supervisor.
* **Path Parameter:**
  * `:id` (e.g. `/employees/101010`) - Employee ID.

### Update Employee
* **Method:** `PUT`
* **Path:** `/employees/:id`
* **Description:** Updates personal and employee fields.
* **Path Parameter:**
  * `:id` (e.g. `/employees/101010`) - Employee ID.
* **Body (JSON - All fields optional):**
  ```json
  {
    "name": "John S. Doe",
    "email": "johndoe@test.com",
    "phone": "050-2222222",
    "role": "manager",
    "isActive": false,
    "managerId": 202020
  }
  ```

### Delete Employee
* **Method:** `DELETE`
* **Path:** `/employees/:id`
* **Description:** Deletes the employee. (Will fail if they are associated with orders; set `isActive: false` instead).
* **Path Parameter:**
  * `:id` (e.g. `/employees/101010`) - Employee ID.

---

## 2. Customers Module (`/customers`)

### Create Customer
* **Method:** `POST`
* **Path:** `/customers`
* **Description:** Registers a new customer in the personal database.
* **Body (JSON):**
  ```json
  {
    "id": 303030,             // Integer (Required) - National Identity Number
    "name": "Alice Smith",    // String (Required) - Full name
    "email": "alice@gmail.com",// String (Required) - Unique email address
    "phone": "054-3333333"    // String (Optional) - Phone number
  }
  ```

### Get All Customers
* **Method:** `GET`
* **Path:** `/customers`
* **Description:** Retrieves all people who are strictly customers (not employees).

### Search Customers by Name
* **Method:** `GET`
* **Path:** `/customers/name/:name`
* **Description:** Case-insensitive partial matching search for customers.
* **Path Parameter:**
  * `:name` (e.g. `/customers/name/alice`) - The search term.

### Get Customer by ID
* **Method:** `GET`
* **Path:** `/customers/:id`
* **Description:** Retrieves a customer profile along with their order history.
* **Path Parameter:**
  * `:id` (e.g. `/customers/303030`) - Customer ID.

### Update Customer
* **Method:** `PUT`
* **Path:** `/customers/:id`
* **Description:** Updates customer personal details.
* **Path Parameter:**
  * `:id` (e.g. `/customers/303030`) - Customer ID.
* **Body (JSON - All fields optional):**
  ```json
  {
    "name": "Alice S. Miller",
    "email": "alice.miller@gmail.com",
    "phone": "054-9999999"
  }
  ```

### Delete Customer
* **Method:** `DELETE`
* **Path:** `/customers/:id`
* **Description:** Deletes customer. Associated orders remain, but their `customerId` is set to `null`.
* **Path Parameter:**
  * `:id` (e.g. `/customers/303030`) - Customer ID.

---

## 3. Menu Items Module (`/menu`)

### Create Menu Item
* **Method:** `POST`
* **Path:** `/menu`
* **Description:** Creates a new dish or drink on the menu.
* **Body (JSON):**
  ```json
  {
    "name": "Tasty Burger",   // String (Required) - Unique dish name
    "price": 60,              // Integer (Required) - Dish price (must be >= 0)
    "category": "Mains",      // String (Required) - Category (e.g. "Mains", "Drinks")
    "description": "Beef patty"// String (Optional) - Description
  }
  ```

### Get All Menu Items
* **Method:** `GET`
* **Path:** `/menu`
* **Description:** Retrieves menu items.
* **Query Parameters (Optional):**
  * `category` (e.g. `?category=Mains`) - Filter by category.
  * `isAvailable` (e.g. `?isAvailable=true` or `?isAvailable=false`) - Filter by availability.

### Search Menu Items by Name
* **Method:** `GET`
* **Path:** `/menu/name/:name`
* **Description:** Case-insensitive partial matching search for dishes.
* **Path Parameter:**
  * `:name` (e.g. `/menu/name/burger`) - The search term.

### Update Menu Item
* **Method:** `PUT`
* **Path:** `/menu/:id`
* **Description:** Updates dish pricing, category, descriptions, or availability.
* **Path Parameter:**
  * `:id` (e.g. `/menu/1`) - Menu Item ID.
* **Body (JSON - All fields optional):**
  ```json
  {
    "name": "Spicy Burger",
    "price": 65,
    "category": "Mains",
    "description": "Spicy beef patty",
    "isAvailable": true
  }
  ```

### Delete Menu Item
* **Method:** `DELETE`
* **Path:** `/menu/:id`
* **Description:** Deletes the menu item. (Will fail if the item was ordered in past orders; set `isAvailable: false` instead).
* **Path Parameter:**
  * `:id` (e.g. `/menu/1`) - Menu Item ID.

---

## 4. Orders Module (`/orders`)

### Create Order (Open Order)
* **Method:** `POST`
* **Path:** `/orders`
* **Description:** Opens a new order for a table, calculates the total amount, and records item details inside a transaction.
* **Body (JSON):**
  ```json
  {
    "tableNumber": 5,          // Integer (Required) - Table number (must be >= 1)
    "employeeId": 101010,      // Integer (Required) - ID of waiter (must be active)
    "customerId": 303030,      // Integer (Optional) - ID of customer (must not be employee)
    "items": [                 // Array (Required) - Non-empty array of dishes
      {
        "menuItemId": 1,       // Integer (Required) - Dish ID (must be available)
        "quantity": 2,         // Integer (Required) - Quantity (must be >= 1)
        "notes": "no onions"   // String (Optional) - Specific instructions
      }
    ]
  }
  ```

### Get All Orders
* **Method:** `GET`
* **Path:** `/orders`
* **Description:** Retrieves all orders.
* **Query Parameters (Optional):**
  * `status` (e.g. `?status=received`) - Filter by status (`received`, `in_progress`, `ready`, `paid`, `cancelled`).
  * `tableNumber` (e.g. `?tableNumber=5`) - Filter by dining table.

### Search Orders by Customer Name
* **Method:** `GET`
* **Path:** `/orders/customer/name/:name`
* **Description:** Search for orders by customer name.
* **Path Parameter:**
  * `:name` (e.g. `/orders/customer/name/alice`) - Customer name.

### Get Order by ID
* **Method:** `GET`
* **Path:** `/orders/:id`
* **Description:** Retrieves full order details including waiter profile, customer profile, and nested items (with quantities, snapshot prices, and notes).
* **Path Parameter:**
  * `:id` (e.g. `/orders/1`) - Order ID.

### Update Order Status
* **Method:** `PUT`
* **Path:** `/orders/:id`
* **Description:** Updates the state of an order.
* **Path Parameter:**
  * `:id` (e.g. `/orders/1`) - Order ID.
* **Body (JSON):**
  ```json
  {
    "status": "paid"           // String (Required) - "received", "in_progress", "ready", "paid", "cancelled"
  }
  ```

### Delete Order (Cancel)
* **Method:** `DELETE`
* **Path:** `/orders/:id`
* **Description:** Deletes the order and automatically cascades to delete all linked items.
* **Path Parameter:**
  * `:id` (e.g. `/orders/1`) - Order ID.

---

## 5. Order Items Nested Endpoints (`/orders/:id/items`)

*Note: Modifying items is only allowed on active orders (status is not 'paid' or 'cancelled').*

### Add Dish to Order
* **Method:** `POST`
* **Path:** `/orders/:id/items`
* **Description:** Appends a new dish to an active order. If the dish already exists in the order, it increases the quantity. Automatically updates the order's `totalAmount`.
* **Path Parameter:**
  * `:id` (e.g. `/orders/1`) - Order ID.
* **Body (JSON):**
  ```json
  {
    "menuItemId": 2,           // Integer (Required) - Menu item ID (must be available)
    "quantity": 1,             // Integer (Required) - Quantity to add
    "notes": "extra sauce"     // String (Optional) - Special instructions
  }
  ```

### Update Dish in Order
* **Method:** `PUT`
* **Path:** `/orders/:id/items/:menuItemId`
* **Description:** Updates the quantity or notes of a specific dish in an order. Automatically adjusts the order's `totalAmount`.
* **Path Parameters:**
  * `:id` (e.g. `/orders/1`) - Order ID.
  * `:menuItemId` (e.g. `/orders/1/items/2`) - Menu Item ID.
* **Body (JSON - At least one is required):**
  ```json
  {
    "quantity": 3,             // Integer (Optional) - New quantity (must be >= 1)
    "notes": "no onions"       // String (Optional) - New instructions
  }
  ```

### Remove Dish from Order
* **Method:** `DELETE`
* **Path:** `/orders/:id/items/:menuItemId`
* **Description:** Completely removes a dish from the order and deducts its cost from `totalAmount`.
* **Path Parameters:**
  * `:id` (e.g. `/orders/1`) - Order ID.
  * `:menuItemId` (e.g. `/orders/1/items/2`) - Menu Item ID.
