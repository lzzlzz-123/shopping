# User Service

用户信息管理微服务，负责处理与用户相关的所有业务逻辑。

## 功能

- 用户信息的增删改查
- 用户数据缓存（Redis）
- 用户验证

## 数据库表

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API 端点

### 获取所有用户
```
GET /
```

### 获取用户详情
```
GET /:id
```

### 创建用户
```
POST /
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "address": "北京市"
}
```

### 更新用户
```
PUT /:id
Content-Type: application/json

{
  "name": "李四",
  "email": "lisi@example.com",
  "phone": "13900139000",
  "address": "上海市"
}
```

### 删除用户
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
PORT=8081
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
