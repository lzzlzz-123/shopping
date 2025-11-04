# 快速开始指南

## 前置要求

- Docker 和 Docker Compose
- Node.js 14+ (可选，本地开发用)
- npm 或 yarn (可选，本地开发用)

## 使用 Docker Compose 快速启动（推荐）

### 1. 克隆项目

```bash
git clone <repository>
cd project
```

### 2. 启动所有服务

```bash
docker-compose up -d
```

### 3. 检查服务状态

```bash
docker-compose ps
```

所有服务应该处于 "running" 状态。

### 4. 访问应用

- **前端管理后台**: http://localhost:3000
- **API Gateway**: http://localhost:8080/api
- **User Service**: http://localhost:8081
- **Merchant Service**: http://localhost:8082
- **Product Service**: http://localhost:8083
- **Order Service**: http://localhost:8084

### 5. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f user-service
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

### 6. 停止所有服务

```bash
docker-compose down
```

## 本地开发启动

如果您想在本地开发环境中运行每个服务（不使用 Docker）：

### 启动数据库和缓存

```bash
# 使用 Docker Compose 只启动 MySQL 和 Redis
docker-compose up -d mysql redis
```

### 启动每个微服务

在不同的终端窗口中运行：

```bash
# Terminal 1: User Service
cd services/user-service
npm install
npm run dev

# Terminal 2: Merchant Service
cd services/merchant-service
npm install
npm run dev

# Terminal 3: Product Service
cd services/product-service
npm install
npm run dev

# Terminal 4: Order Service
cd services/order-service
npm install
npm run dev

# Terminal 5: API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 6: Frontend
cd frontend
npm install
npm start
```

## 测试 API

### 创建用户

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "address": "北京市"
  }'
```

### 创建商家

```bash
curl -X POST http://localhost:8080/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "小卖铺",
    "owner_id": 1,
    "description": "优质商家",
    "phone": "13800138000",
    "email": "merchant@example.com",
    "address": "北京市"
  }'
```

### 创建商品

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "merchant_id": 1,
    "description": "最新款iPhone",
    "price": 6999,
    "stock": 100,
    "category": "电子产品"
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
        "price": 6999
      }
    ]
  }'
```

### 获取所有用户

```bash
curl http://localhost:8080/api/users
```

### 获取用户详情

```bash
curl http://localhost:8080/api/users/1
```

## 数据库初始化（导入示例数据）

服务启动后，您可以导入示例数据来进行测试。系统提供了多种方式来初始化数据库。

### 快速导入（推荐）

#### 方式1：使用 Shell 脚本（Linux/Mac）

```bash
chmod +x sql/import-database.sh
./sql/import-database.sh
```

#### 方式2：使用 Node.js 脚本（所有平台）

```bash
# 如果还没有安装依赖
npm install mysql2 dotenv

# 运行导入脚本
node sql/import-database.js
```

#### 方式3：使用 MySQL 命令行

```bash
# 方式1：直接导入
mysql -u root -p microservices < sql/init-database.sql

# 方式2：指定主机和端口
mysql -h localhost -P 3306 -u root -p microservices < sql/init-database.sql
```

### 导入的示例数据

导入脚本会为您创建并填充以下表格：
- **5 个用户** - 用于测试用户相关 API
- **5 个商家** - 分布在不同的产品类别
- **15 个商品** - 电子产品、服装、家具、运动、美妆等
- **5 个订单** - 不同订单状态（待处理、已确认、已发货、已交付）

### 验证导入成功

```bash
# 查看数据统计
mysql -u root -p microservices -e "
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'merchants', COUNT(*) FROM merchants
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
"
```

应该看到如下输出：
```
| table_name  | rows |
|-------------|------|
| users       |    5 |
| merchants   |    5 |
| products    |   15 |
| orders      |    5 |
| order_items |   13 |
```

### 自定义导入参数

如果您使用了不同的 MySQL 凭据，可以通过环境变量指定：

```bash
# Linux/Mac
export DATABASE_HOST=192.168.1.100
export DATABASE_USER=admin
export DATABASE_PASSWORD=yourpassword
./sql/import-database.sh

# 或者在命令行中直接设置
DATABASE_USER=admin DATABASE_PASSWORD=pass123 ./sql/import-database.sh
```

### 重置数据库

如果需要清空数据并重新导入：

```bash
# 使用 Docker 清除数据卷
docker-compose down -v

# 重新启动服务（会自动创建新的数据库）
docker-compose up -d

# 重新导入示例数据
./sql/import-database.sh
```

更多详细信息请参考 [SQL 导入指南](./SQL_IMPORT_GUIDE.md)。

## 常见问题

### Docker 容器无法启动

检查是否有端口占用：

```bash
# Linux/Mac
lsof -i :8080  # 检查 8080 端口
lsof -i :3000  # 检查 3000 端口

# Windows
netstat -ano | findstr :8080
```

### 数据库连接失败

确保 MySQL 容器已启动并等待片刻让数据库初始化：

```bash
docker-compose logs mysql
```

### 前端无法连接到 API

检查 API Gateway 是否在运行：

```bash
curl http://localhost:8080/health
```

应该返回：
```json
{"status":"API Gateway is running"}
```

### 重置数据库

```bash
# 停止容器并删除数据卷
docker-compose down -v

# 重新启动
docker-compose up -d
```

## 项目结构

```
.
├── services/
│   ├── api-gateway/        # API 网关
│   ├── user-service/       # 用户服务
│   ├── merchant-service/   # 商家服务
│   ├── product-service/    # 商品服务
│   └── order-service/      # 订单服务
├── frontend/               # 前端应用
├── docker-compose.yml      # Docker 编排文件
├── README.md              # 项目文档
└── QUICK_START.md         # 本文件
```

## 下一步

- 查看 [README.md](./README.md) 了解更多架构信息
- 查看各个服务的 README 了解详细 API 文档
- 在前端应用中测试各个功能

## 获得帮助

如有问题，请：

1. 检查服务日志：`docker-compose logs`
2. 确保所有容器都在运行：`docker-compose ps`
3. 重启所有服务：`docker-compose restart`
4. 查看各服务的 README 文档

## 许可证

MIT
