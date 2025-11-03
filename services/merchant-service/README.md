# Merchant Service

商家信息管理微服务，负责处理与商家相关的所有业务逻辑。

## 功能

- 商家信息的增删改查
- 商家数据缓存（Redis）
- 商家状态管理

## 数据库表

```sql
CREATE TABLE merchants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INT,
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address VARCHAR(500),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API 端点

### 获取所有商家
```
GET /
```

### 获取商家详情
```
GET /:id
```

### 创建商家
```
POST /
Content-Type: application/json

{
  "name": "小卖铺",
  "owner_id": 1,
  "description": "优质商家",
  "phone": "13800138000",
  "email": "merchant@example.com",
  "address": "北京市",
  "status": "active"
}
```

### 更新商家
```
PUT /:id
Content-Type: application/json

{
  "name": "大卖铺",
  "status": "active"
}
```

### 删除商家
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
PORT=8082
DATABASE_HOST=mysql
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=microservices
REDIS_HOST=redis
REDIS_PORT=6379
```

## 依赖服务

- MySQL 数据库
- Redis 缓存
