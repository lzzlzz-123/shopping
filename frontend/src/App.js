import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import UserManagement from './pages/UserManagement';
import MerchantManagement from './pages/MerchantManagement';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link to="/users">用户管理</Link>,
    },
    {
      key: 'merchants',
      icon: <ShopOutlined />,
      label: <Link to="/merchants">商家管理</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link to="/products">商品管理</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">订单管理</Link>,
    },
  ];

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ background: '#001529' }}
        >
          <div className="logo">
            <h2 style={{ color: 'white', padding: '20px', margin: 0 }}>
              {collapsed ? '电商' : '微服务电商系统'}
            </h2>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            items={menuItems}
            defaultSelectedKeys={['users']}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              {collapsed ? '☰' : '✕'}
            </button>
          </Header>
          <Content style={{ margin: '16px', padding: '24px', background: '#fff' }}>
            <Routes>
              <Route path="/users" element={<UserManagement />} />
              <Route path="/merchants" element={<MerchantManagement />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/" element={<UserManagement />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
