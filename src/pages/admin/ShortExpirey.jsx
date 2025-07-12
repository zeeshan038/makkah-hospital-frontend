import React, { useState, useEffect } from 'react';
import { Table, Input, Card, theme, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant';

const { Search } = Input;

const ShortExpirey = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [expiryData, setExpiryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchExpiryData();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/stock/short-expirey`, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          name: searchText,
        }
      });
      if (response.data.status) {
        setExpiryData(response.data.medicines);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      }
    } catch (error) {
      console.error('Error fetching short expiry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Medicine Name',
      dataIndex: 'name',
      key: 'medicineName',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Earliest Expiry',
      dataIndex: 'earliestExpiry',
      key: 'earliestExpiry',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total Quantity',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        minHeight: 360,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>Medicines to be Expired</h2>
        </Col>
        <Col xs={24} sm={12}>
          <Search
            placeholder="Search by medicine name"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: '100%' }}
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
      </Row>
      <Card bordered={false} style={{ width: '100%' }}>
        <Table
          columns={columns}
          dataSource={expiryData}
          loading={loading}
          rowKey="medicineId"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default ShortExpirey;