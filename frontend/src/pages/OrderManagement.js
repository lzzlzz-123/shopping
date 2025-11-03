import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Input,
  Button,
  Modal,
  message,
  Space,
  Popconfirm,
  Select,
  Drawer,
  Descriptions,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { orderAPI, userAPI, productAPI } from '../api';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      message.error('获取订单列表失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('获取商品列表失败:', error);
    }
  };

  const showModal = (order = null) => {
    setEditingOrder(order);
    if (order) {
      form.setFieldsValue(order);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showDrawer = async (orderId) => {
    try {
      const response = await orderAPI.getById(orderId);
      setSelectedOrder(response.data);
      setIsDrawerVisible(true);
    } catch (error) {
      message.error('获取订单详情失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      message.success('订单状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('更新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await orderAPI.delete(id);
      message.success('订单删除成功');
      fetchOrders();
    } catch (error) {
      message.error('删除失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: ['user_info', 'name'],
      key: 'user_name',
    },
    {
      title: '总金额',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `¥${parseFloat(price).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: '待处理',
          confirmed: '已确认',
          shipped: '已发货',
          delivered: '已送达',
          cancelled: '已取消',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showDrawer(record.id)}
          >
            查看
          </Button>
          <Select
            style={{ width: 120 }}
            value={record.status}
            options={[
              { value: 'pending', label: '待处理' },
              { value: 'confirmed', label: '已确认' },
              { value: 'shipped', label: '已发货' },
              { value: 'delivered', label: '已送达' },
              { value: 'cancelled', label: '已取消' },
            ]}
            onChange={(value) => handleStatusChange(record.id, value)}
            size="small"
          />
          <Popconfirm
            title="删除订单"
            description="确定要删除此订单吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="app-container">
      <div className="module-header">
        <span className="module-title">订单管理</span>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="订单详情"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={600}
      >
        {selectedOrder && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="订单ID">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="用户">
                {selectedOrder.user_info?.name} ({selectedOrder.user_info?.email})
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {selectedOrder.status}
              </Descriptions.Item>
              <Descriptions.Item label="总金额">
                ¥{parseFloat(selectedOrder.total_price).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedOrder.created_at).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(selectedOrder.updated_at).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>订单商品</h3>
            <Table
              columns={[
                {
                  title: '商品名称',
                  dataIndex: ['product_info', 'name'],
                  key: 'product_name',
                },
                {
                  title: '数量',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: '单价',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `¥${parseFloat(price).toFixed(2)}`,
                },
                {
                  title: '小计',
                  key: 'subtotal',
                  render: (_, record) => `¥${(record.quantity * record.price).toFixed(2)}`,
                },
              ]}
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}

export default OrderManagement;
