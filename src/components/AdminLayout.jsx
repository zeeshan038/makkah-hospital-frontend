import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { 
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  MessageOutlined,
  MedicineBoxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard', path: '/dashboard' },
    {
      key: '2', icon: <AppstoreOutlined />, label: 'Inventory',
      children: [
        { key: '2.1', label: 'View Inventory', path: '/inventory' },
        { key: '2.2', label: 'Add Product', path: '/inventory/add' },
      ],
    },
    {
      key: '4', icon: <AppstoreOutlined />, label: 'Patients', path: '/patients' },
    {
      key: '3', icon: <FileTextOutlined />, label: 'Reports',
      children: [
        { key: '3.1', label: 'Sales Report', path: '/sales' },
        { key: '3.2', label: 'Sales-history', path: '/total-sales' },
      ],
    },
    {
      key: '4', icon: <UserOutlined />, label: 'Expirey',
      children: [
        { key: '5.1', label: 'Short Expirey', path: '/short-expirey' },
        { key: '5.2', label: 'Expired', path: '/expired' },
      ],
    }
  ];

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
          <Menu.Item 
            key={item.key} 
            icon={item.icon} 
            className={location.pathname === item.path ? 'ant-menu-item-selected-custom' : ''}
            onClick={() => navigate(item.path)}
          >
            {item.label} {item.badge && <span className="ant-menu-item-badge">{item.badge}</span>}
          </Menu.Item>
        );
      }
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          backgroundColor: '#2f3f50',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ backgroundColor: '#2f3f50', borderRight: 0, marginTop: 70 }}
        >
          {renderMenuItems(sidebarItems)}
        </Menu>
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#888', borderTop: '1px solid #4a5a6a' }}>
          <p>Powered by Subash © 2022</p>
          <p>v 1.1.2</p>
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 0 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {location.pathname === '/dashboard' ? 'Dashboard' : 'Inventory'}
          </h1>
       <Link to={'/'}>
       <Button type="primary" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>Home</Button>
       </Link>
        </Header>
        <Content style={{ margin: `24px ${collapsed ? 0 : 16}px`, overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 