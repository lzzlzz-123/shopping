# Product Service

商品信息管理微服务，负责处理与商品相关的所有业务逻辑。

## 功能

- 商品信息的增删改查
- 商品库存管理
- 商品数据缓存（Redis）
- **服务消费者**：调用 Merchant Service 获取商家信息

## 数据库表

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  merchant_id INT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  category VARCHAR(100),
  image_url VARCHAR(500),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API 端点

### 获取所有商品
```
GET /
```

### 获取商品详情
```
GET /:id
```

### 创建商品
```
POST /
Content-Type: application/json

{
  "name": "商品名称",
  "merchant_id": 1,
  "description": "商品描述",
  "price": 99.99,
  "stock": 100,
  "category": "电子产品",
  "image_url": "http://example.com/image.jpg",
  "status": "active"
}
```

### 更新商品
```
PUT /:id
Content-Type: application/json

{
  "name": "商品名称",
  "price": 88.88
}
```

### 删除商品
```
DELETE /:id
```

### 更新商品库存
```
PUT /:id/stock
Content-Type: application/json

{
  "quantity": 10
}
```

## 启动

```bash
npm install
npm start
```

## 环境变量

```env
PORT=8083
DATABASE_HOST=mysql
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=microservices
REDIS_HOST=redis
REDIS_PORT=6379
MERCHANT_SERVICE_URL=http://merchant-service:8082
```

## 依赖服务

- MySQL 数据库
- Redis 缓存
- Merchant Service（服务消费者）

## 服务间通信

Product Service 调用 Merchant Service 验证商家是否存在，并获取商家信息进行展示。
