# מפרט מערכת: RESTful API לניהול מסעדה

> [!IMPORTANT]
> **סדר עבודה ומדיניות אבטחה:**
> פיתוח השרת יתבצע בשני שלבים עיקריים:
> 1. **שלב א' (נוכחי):** הקמה מלאה של שרת ה-API, בסיס הנתונים והשאילתות ללא מנגנוני אבטחה, אימות (Authentication) או הרשאות (Authorization).
> 2. **שלב ב':** לאחר שהשרת והפונקציונליות הבסיסית מוכנים לחלוטין, נוסיף אבטחה, הרשאות עובדים, והצפנת סיסמאות. שדה ה-`password` במודל `Person` מוגדר מראש אך לא יהיה בשימוש פעיל בשלב א'.

## 1. תיאור השרת ומטרתו
השרת הינו RESTful API לניהול דיגיטלי ומסונכרן של פעילות מסעדה. המערכת משמשת כפלטפורמה מרכזית לכלל הצוות (מנהלים, צוות אירוח ומטבח) במטרה לייעל את חלוקת העבודה, למנוע תקלות בשירות ולעקוב אחר המידע הארגוני בזמן אמת.

### בעיות שהמערכת פותרת
- **נתק תקשורתי:** מניעת חוסר סנכרון בין המלצרים למטבח המוביל לאובדן הזמנות או עיכובים.
- **ניהול מסורבל:** החלפת מעקב ידני אחר שולחנות פתוחים, סטטוס הזמנות וחישוב חשבונות.
- **שימור לקוחות:** מעקב ותיעוד היסטוריית הזמנות של לקוחות קבועים וחברי מועדון.
- **פערי אבטחה:** מניעת גישה לפעולות רגישות במערכת מעובדים ללא הרשאת ניהול מתאימה.

### קהל יעד (Target Audience)
- **צוות ניהול (מנהלים ואחמ"שים):** ניהול הרשאות עובדים, בקרת הכנסות ועדכון דינמי של התפריט.
- **צוות אירוח (מלצרים/ברמנים):** ניהול שוטף של שולחנות, הזנת הזמנות בזמן אמת, הפקת חשבונות וקישור לקוחות למועדון.

### תכונות ושירותים (Features)
- **ניהול עובדים והרשאות:** רישום ואימות התומך בהיררכיה ארגונית (מנהל, אחמ"ש, מלצר).
- **ניהול תפריט (CRUD):** הוספה, עריכה, מחיקה ושליפה של מנות מקוטלגות.
- **מערכת הזמנות חכמה:** פתיחת שולחנות, שיוך מנות וניהול מחזור חיי ההזמנה (`received` -> `paid`).
- **ניהול מאגר לקוחות:** רישום משתמשים וקישורם המובנה להזמנות שביצעו במסעדה.

---

## 2. מבנה בסיס הנתונים (טבלאות ושדות)

### People (אנשים - טבלת בסיס)
| שם השדה | טיפוס נתונים | הגבלות |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key (תעודת זהות, לא autoIncrement) |
| `name` | STRING | `allowNull: false` |
| `email` | STRING | `allowNull: false`, `unique: true`, `isEmail` |
| `phone` | STRING | `allowNull: true` |
| `password` | STRING | `allowNull: true` |

### Employees (עובדים)
| שם השדה | טיפוס נתונים | הגבלות |
| :--- | :--- | :--- |
| `peopleId` | INTEGER | Primary Key, Foreign Key (`People.id`), `onDelete: CASCADE` |
| `role` | STRING | `allowNull: false`, `defaultValue: 'waiter'` |
| `isActive` | BOOLEAN | `allowNull: false`, `defaultValue: true` |
| `managerId` | INTEGER | Foreign Key (`Employees.peopleId`), `allowNull: true`, `onDelete: SET NULL` |

### MenuItems (תפריט ומנות)
| שם השדה | טיפוס נתונים | הגבלות |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, `autoIncrement: true` |
| `name` | STRING | `allowNull: false`, `unique: true` |
| `price` | INTEGER | `allowNull: false`, `validate: { min: 0 }` |
| `category` | STRING | `allowNull: false` |
| `description` | STRING | `allowNull: true` |
| `isAvailable` | BOOLEAN | `allowNull: false`, `defaultValue: true` |

### Orders (הזמנות)
| שם השדה | טיפוס נתונים | הגבלות |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, `autoIncrement: true` |
| `tableNumber` | INTEGER | `allowNull: false`, `validate: { min: 1 }` |
| `status` | STRING | `allowNull: false`, `defaultValue: 'received'`, `isIn: [['received', 'in_progress', 'ready', 'paid', 'cancelled']]` |
| `totalAmount` | INTEGER | `allowNull: false`, `defaultValue: 0`, `validate: { min: 0 }` |
| `employeeId` | INTEGER | Foreign Key (`Employees.peopleId`), `allowNull: false`, `onDelete: RESTRICT` |
| `customerId` | INTEGER | Foreign Key (`People.id`), `allowNull: true`, `onDelete: SET NULL` |

### OrderItems (טבלת ציר - הזמנה ↔ מנות)
| שם השדה | טיפוס נתונים | הגבלות |
| :--- | :--- | :--- |
| `orderId` | INTEGER | Foreign Key (`Orders.id`), `allowNull: false`, `onDelete: CASCADE` |
| `menuItemId` | INTEGER | Foreign Key (`MenuItems.id`), `allowNull: false`, `onDelete: RESTRICT` |
| `quantity` | INTEGER | `allowNull: false`, `defaultValue: 1`, `validate: { min: 1 }` |
| `priceAtOrder` | INTEGER | `allowNull: true` |
| `notes` | STRING | `allowNull: true` |

---

## 3. קשרים ומערכות יחסים (Sequelize Associations)

```javascript
// אדם <-> עובד (1:1)
Person.hasOne(Employee, { foreignKey: 'peopleId', onDelete: 'CASCADE' });
Employee.belongsTo(Person, { foreignKey: 'peopleId' });

// עובד <-> עובד (היררכיה 1:N)
Employee.hasMany(Employee, { foreignKey: 'managerId', as: 'subordinates' });
Employee.belongsTo(Employee, { foreignKey: 'managerId', as: 'manager' });

// עובד (מלצר) <-> הזמנה (1:N)
Employee.hasMany(Order, { foreignKey: 'employeeId' });
Order.belongsTo(Employee, { foreignKey: 'employeeId', as: 'waiter' });

// אדם (לקוח) <-> הזמנה (1:N)
Person.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Person, { foreignKey: 'customerId', as: 'customer' });

// הזמנה <-> מנה בתפריט (N:M דרך OrderItems)
Order.belongsToMany(MenuItem, { through: OrderItem, foreignKey: 'orderId' });
MenuItem.belongsToMany(Order, { through: OrderItem, foreignKey: 'menuItemId' });

# תכנון נקודות קצה ובקשות (API Endpoints Specification)

מפרט מלא ומסודר של נקודות הקצה (RESTful API), מבנה הבקשות, פרמטרים ותשובות שרת.

---

## תוכן עניינים
- [1. ניהול עובדים (Employees)](#1-ניהול-עובדים-employees)
- [2. ניהול תפריט (Menu Items)](#2-ניהול-תפריט-menu-items)
- [3. ניהול הזמנות (Orders)](#3-ניהול-הזמנות-orders)
- [4. ניהול לקוחות (Customers)](#4-ניהול-לקוחות-customers)

---

## 1. ניהול עובדים (Employees)

### `POST /employees`
* **תיאור:** יצירת עובד חדש במערכת (`Register/Create`).
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "name": "string",
    "email": "string",
    "role": "string",
    "managerId": "string | null"
  }
  ```
* **הצלחה:**
  * **סטטוס:** `201 Created`
  * **תוכן:** מחזיר אובייקט JSON עם פרטי העובד שנוצר.
* **שגיאה:**
  * **סטטוס:** `400 Bad Request` (למשל: חסרים שדות חובה, או שהמייל כבר קיים במערכת).

---

### `GET /employees`
* **תיאור:** שליפת רשימת עובדים.
* **פרמטרי שאילתה (`Query Params` - אופציונלי):**
  * `role` – סינון לפי תפקיד (למשל: `?role=waiter`).
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של אובייקטי עובדים.

---

### `GET /employees/name/:name`
* **תיאור:** חיפוש עובדים לפי שם (חלקי ואינו רגיש לאותיות רישיות).
* **פרמטרי נתיב (`Path Params`):**
  * `name` – השם או חלק מהשם לחיפוש.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של עובדים תואמים.

---

### `GET /employees/:id`
* **תיאור:** שליפת עובד ספציפי.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – המזהה הייחודי של העובד בשורת הכתובת.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר אובייקט עם פרטי העובד (ואפשר לכלול גם את העובדים הכפופים לו אם הוא אחמ"ש).
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם העובד לא קיים).

---

### `PUT /employees/:id`
* **תיאור:** עדכון פרטי עובד.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה העובד בנתיב.
* **גוף הבקשה (`Body - JSON` - אופציונלי):**
  ```json
  {
    "name": "string",
    "email": "string",
    "role": "string",
    "managerId": "string"
  }
  ```
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר את אובייקט העובד המעודכן.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם העובד לא קיים).

---

### `DELETE /employees/:id`
* **תיאור:** מחיקת עובד.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה העובד למחיקה.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:**
    ```json
    {
      "message": "Employee deleted"
    }
    ```
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם העובד לא קיים).

---

## 2. ניהול תפריט (Menu Items)

### `POST /menu`
* **תיאור:** יצירת מנה חדשה.
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "name": "string",
    "price": 0.0,
    "category": "string",
    "description": "string"
  }
  ```
* **הצלחה:**
  * **סטטוס:** `201 Created`
  * **תוכן:** מחזיר את פרטי המנה שנוספה לתפריט.
* **שגיאה:**
  * **סטטוס:** `400 Bad Request` (שם או מחיר לא חוקיים).

---

### `GET /menu`
* **תיאור:** שליפת התפריט המלא.
* **פרמטרי שאילתה (`Query Params` - אופציונלי):**
  * `category` – סינון לפי קטגוריה (למשל: `?category=starters`).
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של המנות.

---

### `GET /menu/:id`
* **תיאור:** שליפת מנה בודדת לפי ID.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה המנה בנתיב.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר את פרטי המנה.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם המנה לא קיימת).

---

### `PUT /menu/:id`
* **תיאור:** עדכון מנה קיימת (למשל עדכון מחיר).
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה המנה בנתיב.
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "price": 0.0
  }
  ```
  *(או כל שדה אחר לעדכון כגון `name`, `category`)*
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר את המנה המעודכנת.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (מנה לא נמצאה).

---

### `DELETE /menu/:id`
* **תיאור:** מחיקת מנה מהתפריט.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה המנה למחיקה.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** הודעת אישור על מחיקת המנה.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (מנה לא נמצאה).

---

## 3. ניהול הזמנות (Orders)

### `POST /orders`
* **תיאור:** פתיחת הזמנה חדשה לשולחן.
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "tableNumber": 1,
    "employeeId": "string",
    "customerId": "string",
    "items": [
      {
        "menuItemId": "string",
        "quantity": 1
      }
    ]
  }
  ```
  > **הערה:** שדה `customerId` מתייחס ל-`id` בטבלת `People`.
* **הצלחה:**
  * **סטטוס:** `201 Created`
  * **תוכן:** מחזיר את פרטי ההזמנה המלאה שנפתחה.
* **שגיאה:**
  * **סטטוס:** `400 Bad Request` (למשל אם נשלח מזהה מלצר או לקוח שלא קיימים).

---

### `GET /orders`
* **תיאור:** שליפת כל ההזמנות הפעילות.
* **פרמטרי שאילתה (`Query Params` - אופציונלי):**
  * `status` – סינון לפי מצב (למשל: `?status=preparing`).
  * `tableNumber` – סינון לפי שולחן (למשל: `?tableNumber=12`).
  * *שילוב פרמטרים:* `?status=preparing&tableNumber=12`
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של הזמנות כולל המנות שבתוכן.

---

### `GET /orders/customer/name/:name`
* **תיאור:** חיפוש הזמנות לפי שם הלקוח (חלקי ואינו רגיש לאותיות רישיות).
* **פרמטרי נתיב (`Path Params`):**
  * `name` – שם הלקוח או חלק ממנו.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של הזמנות המקושרות ללקוחות תואמים, כולל פרטי המלצר והמנות.

---

### `GET /orders/:id`
* **תיאור:** שליפת הזמנה בודדת לפי ID.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה ההזמנה.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר את פרטי ההזמנה המלאים (כולל מנות).
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם ההזמנה לא קיימת).

---

### `PUT /orders/:id`
* **תיאור:** עדכון סטטוס הזמנה.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה ההזמנה בנתיב.
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "status": "ready"
  }
  ```
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר את ההזמנה לאחר שינוי הסטטוס.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם ההזמנה לא קיימת).

---

### `DELETE /orders/:id`
* **תיאור:** ביטול/מחיקת הזמנה.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה ההזמנה.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** הודעה שההזמנה בוטלה בהצלחה.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (הזמנה לא קיימת).

---

## 4. ניהול לקוחות (Customers)

### `POST /customers`
* **תיאור:** יצירת אדם חדש ב-`People` (שאינו עובד).
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "name": "string",
    "email": "string"
  }
  ```
* **הצלחה:**
  * **סטטוס:** `201 Created`
  * **תוכן:** מחזיר את פרטי הלקוח שנוצר.
* **שגיאה:**
  * **סטטוס:** `400 Bad Request` (אימייל לא חוקי או קיים).

---

### `GET /customers`
* **תיאור:** שליפת רשימת כל הלקוחות (אנשים שאינם עובדים).
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של אובייקטי לקוחות.

---

### `GET /customers/name/:name`
* **תיאור:** חיפוש לקוחות לפי שם (חלקי ואינו רגיש לאותיות רישיות).
* **פרמטרי נתיב (`Path Params`):**
  * `name` – השם או חלק מהשם לחיפוש.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר מערך של לקוחות תואמים.

---

### `GET /customers/:id`
* **תיאור:** שליפת פרטי לקוח יחד עם היסטוריית ההזמנות שלו מ-`Orders`.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה הלקוח.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר אובייקט לקוח הכולל מערך של הזמנות עבר (`orders`).
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם הלקוח לא נמצא).

---

### `PUT /customers/:id`
* **תיאור:** עדכון פרטי לקוח.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה הלקוח בנתיב.
* **גוף הבקשה (`Body - JSON`):**
  ```json
  {
    "name": "string",
    "email": "string"
  }
  ```
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** מחזיר את פרטי הלקוח המעודכנים.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (אם הלקוח לא קיים).

---

### `DELETE /customers/:id`
* **תיאור:** מחיקת לקוח.
* **פרמטרי נתיב (`Path Params`):**
  * `id` – מזהה הלקוח למחיקה.
* **הצלחה:**
  * **סטטוס:** `200 OK`
  * **תוכן:** הודעת הצלחה.
* **שגיאה:**
  * **סטטוס:** `404 Not Found` (לקוח לא נמצא).