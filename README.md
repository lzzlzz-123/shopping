# 微服务电商系统

一个基于微服务架构的电商系统，采用前后端分离设计。

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                      Port: 3000                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/API
┌──────────────────────────▼──────────────────────────────────┐
│                    API Gateway                              │
│                    Port: 8080                               │
└──┬──────────────┬──────────────┬──────────────┬────────────┘
   │              │              │              │
   ▼              ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐
│ User   │  │ Merchant │  │ Product │  │ Order   │
│Service │  │ Service  │  │Service  │  │Service  │
│8081    │  │8082      │  │8083     │  │8084     │
└────────┘  └──────────┘  └─────────┘  └─────────┘
   │              │              │              │
   └──────────────┴──────────────┴──────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
   ┌──────┐   ┌────────┐  ┌──────────┐
   │MySQL │   │ Redis  │  │Shared DB │
   │3306  │   │6379    │  │          │
   └──────┘   └────────┘  └──────────┘
```

## 模块功能

### 1. API Gateway (8080)
- 请求路由和聚合
- 负载均衡
- 跨域处理
- 认证和授权

### 2. User Service (8081)
- 用户注册和登录
- 用户信息管理
- 用户列表查询

**关键API:**
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

### 3. Merchant Service (8082)
- 商家信息管理
- 商家认证
- 商家列表查询

**关键API:**
- `GET /api/merchants` - 获取商家列表
- `POST /api/merchants` - 创建商家
- `GET /api/merchants/:id` - 获取商家详情
- `PUT /api/merchants/:id` - 更新商家信息
- `DELETE /api/merchants/:id` - 删除商家

### 4. Product Service (8083)
- 商品信息管理
- 商品搜索和分类
- 商品库存管理
- **服务消费者**: 调用 Merchant Service 获取商家信息

**关键API:**
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 创建商品
- `GET /api/products/:id` - 获取商品详情
- `PUT /api/products/:id` - 更新商品信息
- `DELETE /api/products/:id` - 删除商品
- `PUT /api/products/:id/stock` - 更新库存

### 5. Order Service (8084)
- 订单创建和管理
- 订单状态跟踪
- 订单查询
- **服务消费者**: 调用 User Service、Product Service 获取用户和商品信息

**关键API:**
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单
- `GET /api/orders/:id` - 获取订单详情
- `PUT /api/orders/:id/status` - 更新订单状态
- `DELETE /api/orders/:id` - 取消订单

### 6. Frontend (3000)
- React单页应用
- 响应式用户界面
- 与API Gateway通信

## 项目结构

```
project/
├── services/
│   ├── api-gateway/           # API网关服务
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   ├── user-service/          # 用户服务
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   ├── merchant-service/      # 商家服务
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   ├── product-service/       # 商品服务
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   └── order-service/         # 订单服务
│       ├── src/
│       ├── Dockerfile
│       ├── package.json
│       └── README.md
├── frontend/                   # 前端应用
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml         # Docker编排文件
└── README.md

```

## 快速开始

### 前置要求
- Docker & Docker Compose
- Node.js 14+ (本地开发)
- npm 或 yarn

### 使用 Docker Compose 启动

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down
```

### 本地开发启动

#### 启动每个服务

```bash
# User Service
cd services/user-service
npm install
npm start

# Merchant Service
cd services/merchant-service
npm install
npm start

# Product Service
cd services/product-service
npm install
npm start

# Order Service
cd services/order-service
npm install
npm start

# API Gateway
cd services/api-gateway
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

## API 使用示例

### 创建用户
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000"
  }'
```

### 创建商家
```bash
curl -X POST http://localhost:8080/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "小卖铺",
    "owner_id": 1,
    "description": "优质商家"
  }'
```

### 创建商品
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "商品名称",
    "merchant_id": 1,
    "price": 99.99,
    "stock": 100,
    "description": "商品描述"
  }'
```

### 创建订单
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 99.99
      }
    ]
  }'
```

## 技术栈

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web框架
- **MySQL** - 关系型数据库
- **Redis** - 缓存
- **Axios** - HTTP客户端（用于服务间通信）

### 前端
- **React** - UI框架
- **React Router** - 路由管理
- **Axios** - HTTP客户端
- **Ant Design** - UI组件库

## 服务间通信

### 同步通信 (HTTP/REST)
- API Gateway 调用各个微服务
- Product Service 调用 Merchant Service
- Order Service 调用 User Service 和 Product Service

### 错误处理
所有服务间调用都包含重试机制和超时控制。

## 数据库设计

所有服务共享同一个MySQL数据库，包含以下表：

- `users` - 用户表
- `merchants` - 商家表
- `products` - 商品表
- `orders` - 订单表
- `order_items` - 订单详情表

## 缓存策略

使用Redis缓存：
- 用户信息缓存 (TTL: 1小时)
- 商家信息缓存 (TTL: 1小时)
- 商品信息缓存 (TTL: 30分钟)
- 会话信息缓存

## 开发指南

### 添加新端点

1. 在对应服务的 `src/routes` 中添加路由
2. 在 `src/controllers` 中实现业务逻辑
3. 在 `src/models` 中定义数据模型
4. 在 API Gateway 中配置路由转发

### 调试

使用 `DEBUG=*` 环境变量启动服务查看详细日志：

```bash
DEBUG=* npm start
```

## 许可证

MIT

## 联系方式

如有问题，请提交Issue或Pull Request。
