# Order Service

订单管理微服务，负责处理与订单相关的所有业务逻辑。

## 功能

- 订单的增删改查
- 订单状态管理
- 订单项管理
- **服务消费者**：调用 User Service 和 Product Service 获取用户及商品信息

## 数据库表

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

## API 端点

### 获取所有订单
```
GET /
```

### 获取订单详情
```
GET /:id
```

### 创建订单
```
POST /
Content-Type: application/json

{
  "user_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 99.99
    },
    {
      "product_id": 2,
      "quantity": 1,
      "price": 49.99
    }
  ]
}
```

### 更新订单状态
```
PUT /:id/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

有效的订单状态：
- `pending` - 待处理
- `confirmed` - 已确认
- `shipped` - 已发货
- `delivered` - 已送达
- `cancelled` - 已取消

### 删除订单
```
DELETE /:id
```

## 启动

```bash
npm install
npm start
```

## 环境变量

```env
PORT=8084
DATABASE_HOST=mysql
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=microservices
REDIS_HOST=redis
REDIS_PORT=6379
USER_SERVICE_URL=http://user-service:8081
PRODUCT_SERVICE_URL=http://product-service:8083
```

## 依赖服务

- MySQL 数据库
- Redis 缓存
- User Service（服务消费者）
- Product Service（服务消费者）

## 服务间通信

- 创建订单时，Order Service 调用 User Service 验证用户是否存在
- 创建订单时，Order Service 调用 Product Service 验证商品是否存在并获取价格
- 获取订单详情时，Order Service 调用 User Service 和 Product Service 获取用户及商品信息
