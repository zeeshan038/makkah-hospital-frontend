import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, message } from 'antd';
import { 
  AppstoreOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant';
import { useNavigate } from 'react-router-dom';

const ViewInventory = () => {
  const navigate = useNavigate();
  const [stockSummary, setStockSummary] = useState({
    totalStocks: 0,
    totalStockIn: 0,
    totalStockOut: 0,
    totalShortExpiry: 0,
  });
  const [medicines, setMedicines] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/stock/summary`);
        setStockSummary(response.data);
      } catch (error) {
        console.error('Error fetching stock summary:', error);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchStockSummary();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoadingMedicines(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/medicine/get-all-med?page=${currentPage}&limit=${itemsPerPage}&name=${debouncedSearch}`);
        if (response.data.status) {
          setMedicines(response.data.medicines);
          setTotalMedicines(response.data.totalCount || response.data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoadingMedicines(false);
      }
    };
    fetchMedicines();
  }, [currentPage, debouncedSearch]);

  const handleView = async (medicineId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/medicine/get-med-inven/${medicineId}`);
      navigate(`/inventory/${medicineId}`);
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      message.error('Error fetching medicine details');
    }
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">
          {category}
        </Tag>
      ),
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Tag color={quantity > 100 ? 'green' : 'red'}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Price (Rs.)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `Rs. ${price}`,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleView(record._id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
          >
            <AppstoreOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {loadingSummary ? 'Loading...' : stockSummary.totalStocks}
            </h3>
            <Button type="link" style={{ color: '#2c988c' }}>Total Stocks »</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
          >
            <PlusCircleOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {loadingSummary ? 'Loading...' : stockSummary.totalStockIn}
            </h3>
            <Button type="link" style={{ color: '#2c988c' }}>Stock In »</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #facc15', textAlign: 'center' }}
          >
            <MinusCircleOutlined style={{ fontSize: '40px', color: '#facc15', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {loadingSummary ? 'Loading...' : stockSummary.totalStockOut}
            </h3>
            <Button type="link" style={{ color: '#b49200' }}>Stock Out</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #ef4444', textAlign: 'center' }}
          >
            <WarningOutlined style={{ fontSize: '40px', color: '#ef4444', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {loadingSummary ? 'Loading...' : stockSummary.totalShortExpiry}
            </h3>
            <Button type="link" style={{ color: '#ef4444' }}>Short Expiry</Button>
          </Card>
        </Col>
      </Row>

      {/* Search bar above table */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 220 }}
        />
      </div>

      {/* Inventory Table */}
      <Card title="Medicine Inventory" bordered={false}>
        <Table
          columns={columns}
          dataSource={medicines}
          loading={loadingMedicines}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: totalMedicines,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false
          }}
          scroll={{ x: 'max-content' }}
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default ViewInventory;