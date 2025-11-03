# Frontend - 微服务电商系统管理后台

基于 React 的前端应用，提供用户、商家、商品和订单的管理界面。

## 功能

- 用户信息管理
- 商家信息管理
- 商品信息管理
- 订单管理和跟踪

## 技术栈

- React 18
- React Router 6
- Ant Design 5
- Axios
- CSS3

## 页面结构

```
├── 用户管理
│   ├── 用户列表
│   ├── 添加用户
│   ├── 编辑用户
│   └── 删除用户
├── 商家管理
│   ├── 商家列表
│   ├── 添加商家
│   ├── 编辑商家
│   └── 删除商家
├── 商品管理
│   ├── 商品列表
│   ├── 添加商品
│   ├── 编辑商品
│   └── 删除商品
└── 订单管理
    ├── 订单列表
    ├── 查看订单详情
    ├── 更新订单状态
    └── 删除订单
```

## 启动

### 开发模式

```bash
npm install
npm start
```

应用将在 http://localhost:3000 启动

### 生产构建

```bash
npm run build
```

### 使用 Docker 启动

```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
```

## 环境变量

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## 项目结构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── UserManagement.js
│   │   ├── MerchantManagement.js
│   │   ├── ProductManagement.js
│   │   └── OrderManagement.js
│   ├── api.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── Dockerfile
```

## API 调用

前端通过 `src/api.js` 中的 API 函数与后端通信。所有请求都通过 API Gateway 转发到对应的微服务。

### 用户 API
```javascript
userAPI.getAll()
userAPI.getById(id)
userAPI.create(data)
userAPI.update(id, data)
userAPI.delete(id)
```

### 商家 API
```javascript
merchantAPI.getAll()
merchantAPI.getById(id)
merchantAPI.create(data)
merchantAPI.update(id, data)
merchantAPI.delete(id)
```

### 商品 API
```javascript
productAPI.getAll()
productAPI.getById(id)
productAPI.create(data)
productAPI.update(id, data)
productAPI.delete(id)
productAPI.updateStock(id, quantity)
```

### 订单 API
```javascript
orderAPI.getAll()
orderAPI.getById(id)
orderAPI.create(data)
orderAPI.updateStatus(id, status)
orderAPI.delete(id)
```

## 界面截图

### 用户管理
- 显示用户列表
- 支持添加、编辑、删除用户
- 显示用户信息：ID、姓名、邮箱、电话、地址

### 商家管理
- 显示商家列表
- 支持添加、编辑、删除商家
- 显示商家信息：ID、名称、所有者ID、邮箱、电话、状态

### 商品管理
- 显示商品列表
- 支持添加、编辑、删除商品
- 显示商品信息：ID、名称、商家、价格、库存、分类、状态

### 订单管理
- 显示订单列表
- 支持查看订单详情
- 支持更新订单状态
- 支持删除订单
- 显示订单详情：订单号、用户、状态、总金额、订单商品列表

## 常见问题

### API 连接失败

确保后端服务已启动并且 `REACT_APP_API_URL` 环境变量设置正确。

### 跨域问题

后端 API Gateway 已配置 CORS，前端可以直接访问。

## 开发指南

### 添加新页面

1. 在 `src/pages` 中创建新的组件
2. 在 `src/App.js` 中添加路由
3. 在导航菜单中添加链接

### 修改样式

- 全局样式在 `src/index.css`
- 组件特定样式在各组件的 CSS 文件中

### 调试

浏览器开发者工具中可以查看网络请求和控制台错误。

## 许可证

MIT
