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
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { merchantAPI } from '../api';

function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getAll();
      setMerchants(response.data);
    } catch (error) {
      message.error('获取商家列表失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const showModal = (merchant = null) => {
    setEditingMerchant(merchant);
    if (merchant) {
      form.setFieldsValue(merchant);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingMerchant) {
        await merchantAPI.update(editingMerchant.id, values);
        message.success('商家更新成功');
      } else {
        await merchantAPI.create(values);
        message.success('商家创建成功');
      }
      setIsModalVisible(false);
      fetchMerchants();
    } catch (error) {
      message.error('操作失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await merchantAPI.delete(id);
      message.success('商家删除成功');
      fetchMerchants();
    } catch (error) {
      message.error('删除失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '商家名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '所有者ID',
      dataIndex: 'owner_id',
      key: 'owner_id',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-${status}`}>
          {status === 'active' ? '活跃' : status === 'inactive' ? '不活跃' : '冻结'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除商家"
            description="确定要删除此商家吗？"
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
        <span className="module-title">商家管理</span>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加商家
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={merchants}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingMerchant ? '编辑商家' : '添加商家'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="商家名称"
            rules={[{ required: true, message: '请输入商家名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="owner_id"
            label="所有者ID"
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
          >
            <Select
              options={[
                { value: 'active', label: '活跃' },
                { value: 'inactive', label: '不活跃' },
                { value: 'suspended', label: '冻结' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MerchantManagement;
