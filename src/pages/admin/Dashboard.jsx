import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Card, Row, Col, Select, Table, Space, Tag, Statistic, Typography, Progress } from 'antd';
import { 
  AppstoreOutlined,
  MedicineBoxOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WarningOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Title, Text } = Typography;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [stockSummary, setStockSummary] = useState({
    totalStockIn: 0,
    totalStockOut: 0,
    totalAvailableStock: 0,
    totalStocks: 0,
    totalShortExpiry: 0,
    totalExpired: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [profitLossData, setProfitLossData] = useState({
    todayProfit: 0,
    todayLoss: 0,
    monthlyProfit: 0,
    monthlyLoss: 0,
    overallProfit: 0,
    overallLoss: 0,
  });
  const [loadingProfitLoss, setLoadingProfitLoss] = useState(true);
  const [profitLossError, setProfitLossError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [loadingTotalSales, setLoadingTotalSales] = useState(true);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [loadingStockValue, setLoadingStockValue] = useState(true);
  const [availableValue, setAvailableValue] = useState(0);
  const [loadingAvailableValue, setLoadingAvailableValue] = useState(true);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [previousMonthData, setPreviousMonthData] = useState({
    totalStocks: 0,
    overallProfit: 0,
    totalAvailableStock: 0,
    totalExpired: 0
  });

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/stock/summary`);
        setStockSummary(response.data);
      } catch (error) {
        setSummaryError('Error fetching stock summary');
        console.error('Error fetching stock summary:', error);
      } finally {
        setLoadingSummary(false);
      }
    };

    const fetchRecentSales = async () => {
      setLoadingSales(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/sale/sales`);
        if (response.data.status) {
          // Group sales by _id
          const salesMap = new Map();
          
          response.data.sales.forEach(sale => {
            if (!salesMap.has(sale._id)) {
              salesMap.set(sale._id, {
                key: sale._id,
                saleId: `S${salesMap.size + 1}`,
                medicine: sale.medicine,
                batchNumber: sale.batchNumber,
                quantity: sale.item.quantitySold,
                purchasePrice: sale.item.purchasePrice,
                sellingPrice: sale.item.sellingPrice,
                profit: sale.item.profit,
                category: sale.item.category,
                brand: sale.item.brand,
                date: new Date(sale.createdAt).toLocaleDateString(),
                time: new Date(sale.createdAt).toLocaleTimeString(),
                status: 'Sold'
              });
            } else {
              const existingSale = salesMap.get(sale._id);
              existingSale.medicine = `${existingSale.medicine} x ${sale.medicine}`;
              existingSale.batchNumber = `${existingSale.batchNumber} x ${sale.batchNumber}`;
              existingSale.quantity = `${existingSale.quantity} x ${sale.item.quantitySold}`;
              existingSale.purchasePrice = `${existingSale.purchasePrice} x ${sale.item.purchasePrice}`;
              existingSale.sellingPrice = `${existingSale.sellingPrice} x ${sale.item.sellingPrice}`;
              existingSale.profit = `${existingSale.profit} x ${sale.item.profit}`;
              existingSale.category = `${existingSale.category} x ${sale.item.category}`;
              existingSale.brand = `${existingSale.brand} x ${sale.item.brand}`;
            }
          });

          const formattedSales = Array.from(salesMap.values()).slice(0, 10);
          setRecentSales(formattedSales);
        }
      } catch (error) {
        console.error('Error fetching recent sales:', error);
      } finally {
        setLoadingSales(false);
      }
    };

    const fetchProfitLoss = async () => {
      try {
        setLoadingProfitLoss(true);
        const response = await axios.get(`${BASE_URL}/api/sale/record`);
        setProfitLossData(response.data);
      } catch (error) {
        setProfitLossError('Error fetching profit/loss data');
        console.error('Error fetching profit/loss data:', error);
      } finally {
        setLoadingProfitLoss(false);
      }
    };

    const fetchTotalSales = async () => {
      try {
        setLoadingTotalSales(true);
        const response = await axios.get(`${BASE_URL}/api/sale/salesNo`);
        if (response.data.status) {
          setTotalSales(response.data.totalSalesAmount || 0);
        }
      } catch (error) {
        console.error('Error fetching total sales:', error);
      } finally {
        setLoadingTotalSales(false);
      }
    };

    const fetchTotalStockValue = async () => {
      try {
        setLoadingStockValue(true);
        const response = await axios.get(`${BASE_URL}/api/stock/stocks-value`);
        if (response.data.status) {
          setTotalStockValue(response.data.totalStockValue || 0);
          setCategoryBreakdown(response.data.categoryBreakdown || []);
        }
      } catch (error) {
        console.error('Error fetching total stock value:', error);
      } finally {
        setLoadingStockValue(false);
      }
    };

    const fetchAvailableValue = async () => {
      try {
        setLoadingAvailableValue(true);
        const response = await axios.get(`${BASE_URL}/api/stock/available-value`);
        if (response.data.status) {
          setAvailableValue(response.data.availablePurchaseValue || 0);
        }
      } catch (error) {
        console.error('Error fetching available value:', error);
      } finally {
        setLoadingAvailableValue(false);
      }
    };

    fetchStockSummary();
    fetchRecentSales();
    fetchProfitLoss();
    fetchTotalSales();
    fetchTotalStockValue();
    fetchAvailableValue();

  }, []);

  const renderMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      } else {
        return (
          <Menu.Item key={item.key} icon={item.icon} className={item.key === '1' ? 'ant-menu-item-selected-custom' : ''}><a href={item.path}>{item.label} {item.badge && <span className="ant-menu-item-badge">{item.badge}</span>}</a></Menu.Item>
        );
      }
    });
  };

  const recentSalesColumns = [
    { 
      title: 'Name', 
      dataIndex: 'medicine', 
      key: 'medicine',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Brand', 
      dataIndex: 'brand', 
      key: 'brand',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Batch', 
      dataIndex: 'batchNumber', 
      key: 'batchNumber',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (text) => {
        if (typeof text === 'string') {
          return text;
        }
        return text || '0';
      }
    },
    { 
      title: 'Purchase Price (Rs.)', 
      dataIndex: 'purchasePrice', 
      key: 'purchasePrice',
      render: (price) => price ? `Rs. ${price}` : 'Rs. 0'
    },
    { 
      title: 'Selling Price (Rs.)', 
      dataIndex: 'sellingPrice', 
      key: 'sellingPrice',
      render: (price) => price ? `Rs. ${price}` : 'Rs. 0'
    },
    { 
      title: 'Profit (Rs.)', 
      dataIndex: 'profit', 
      key: 'profit',
      render: (profit) => profit ? `Rs. ${profit}` : 'Rs. 0'
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color="green">
          {status ? status.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
  ];

  const StatisticCard = ({ title, value, icon, color, loading, prefix, suffix }) => (
    <Card 
      hoverable
      bordered={false}
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        height: '100%'
      }}
    >
      <Row align="middle" gutter={[16, 16]}>
        <Col span={16}>
          <Text type="secondary" style={{ fontSize: '14px' }}>{title}</Text>
          <Statistic
            value={loading ? '...' : value}
            precision={2}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}
          />
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto'
          }}>
            {React.cloneElement(icon, { 
              style: { 
                fontSize: '24px',
                color: color
              }
            })}
          </div>
        </Col>
      </Row>
    </Card>
  );

  const StockProgressCard = ({ title, value, total, color, icon }) => (
    <Card 
      hoverable
      bordered={false}
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        height: '100%'
      }}
    >
      <Row align="middle" gutter={[16, 16]}>
        <Col span={16}>
          <Text type="secondary" style={{ fontSize: '14px' }}>{title}</Text>
          <Statistic
            value={value}
            suffix={`/ ${total}`}
            valueStyle={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}
          />
          <Progress 
            percent={Math.round((value / total) * 100)} 
            showInfo={false}
            strokeColor={color}
            trailColor={`${color}15`}
          />
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto'
          }}>
            {React.cloneElement(icon, { 
              style: { 
                fontSize: '24px',
                color: color
              }
            })}
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
        <div style={{ padding: '24px' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>Dashboard Overview</Title>
          
          {/* Summary Cards - Row 1 */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Total Sales"
                value={totalSales}
                icon={<DollarCircleOutlined />}
                color="#10b981"
                loading={loadingTotalSales}
                prefix="Rs. "
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Total Stocks Value"
                value={totalStockValue}
                icon={<DollarCircleOutlined />}
                color="#6366f1"
                loading={loadingStockValue}
                prefix="Rs. "
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Total Available Value"
                value={availableValue}
                icon={<DollarCircleOutlined />}
                color="#f59e42"
                loading={loadingAvailableValue}
                prefix="Rs. "
              />
            </Col>
          </Row>

          {/* Summary Cards - Row 2 */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Total Stocks"
                value={stockSummary.totalStocks}
                icon={<AppstoreOutlined />}
                color="#4ade80"
                loading={loadingSummary}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Available Stocks"
                value={stockSummary.totalAvailableStock}
                icon={<MedicineBoxOutlined />}
                color="#60a5fa"
                loading={loadingSummary}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Expired Stocks"
                value={stockSummary.totalExpired}
                icon={<WarningOutlined />}
                color="#ef4444"
                loading={loadingSummary}
              />
            </Col>
          </Row>

          {/* Summary Cards - Row 3 */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8} lg={8}>
              <StatisticCard
                title="Total Profit"
                value={profitLossData.overallProfit}
                icon={<DollarCircleOutlined />}
                color="#facc15"
                loading={loadingProfitLoss}
                prefix="Rs. "
              />
            </Col>
          </Row>

          {/* Stock Progress Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <StockProgressCard
                title="Stock In Progress"
                value={stockSummary.totalStockIn}
                total={stockSummary.totalStocks}
                icon={<PlusCircleOutlined />}
                color="#4ade80"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StockProgressCard
                title="Stock Out Progress"
                value={stockSummary.totalStockOut}
                total={stockSummary.totalStocks}
                icon={<MinusCircleOutlined />}
                color="#facc15"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StockProgressCard
                title="Short Expiry Progress"
                value={stockSummary.totalShortExpiry}
                total={stockSummary.totalStocks}
                icon={<WarningOutlined />}
                color="#ef4444"
              />
            </Col>
          </Row>

          {/* Recent Sales Table */}
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Title level={4} style={{ marginBottom: '24px' }}>Recent Sales</Title>
            <Table
              columns={recentSalesColumns}
              dataSource={recentSales}
              loading={loadingSales}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
              }}
              scroll={{ x: 'max-content' }}
              style={{
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            />
          </Card>

          {/* Category Breakdown Table */}
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginTop: '24px'
            }}
          >
            <Title level={4} style={{ marginBottom: '24px' }}>Stock Value by Category</Title>
            <Table
              columns={[
                { title: 'Category', dataIndex: 'category', key: 'category', align: 'center' },
                { title: 'Value (Rs.)', dataIndex: 'value', key: 'value', align: 'center', render: (v) => `Rs. ${v}` },
                { title: 'Items', dataIndex: 'items', key: 'items', align: 'center' },
              ]}
              dataSource={categoryBreakdown.map((row, idx) => ({ ...row, key: idx }))}
              loading={loadingStockValue}
              pagination={false}
              style={{ borderRadius: '8px', overflow: 'hidden' }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;