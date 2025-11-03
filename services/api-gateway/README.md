# API Gateway

API Gateway 是微服务系统的入口点，负责请求的路由和聚合。

## 功能

- 请求路由到对应的微服务
- 提供统一的API入口
- 支持CORS跨域请求
- 提供安全头部设置

## 启动

```bash
npm install
npm start
```

## 环境变量

```env
PORT=8080
USER_SERVICE_URL=http://user-service:8081
MERCHANT_SERVICE_URL=http://merchant-service:8082
PRODUCT_SERVICE_URL=http://product-service:8083
ORDER_SERVICE_URL=http://order-service:8084
```

## API 端点

所有API端点都通过API Gateway访问：

- `/api/users` - 用户服务
- `/api/merchants` - 商家服务
- `/api/products` - 商品服务
- `/api/orders` - 订单服务
- `/health` - 健康检查
- `/api` - API文档
