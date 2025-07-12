import React, { useState } from 'react';
import { Form, Input, Button, Card, message, theme } from 'antd';
import axios from 'axios';
import { BASE_URL } from '../constant';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, values);
      console.log("res" , response)
      if (response.data.status) {
        toast.success(response.data.msg);
        toast.success("User loggedIn successfully!")
        localStorage.setItem('token', response.data.token);
        navigate('/'); // Navigate to home page
      } else {
        console.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: colorBgContainer,
      }}
    >
      <h2
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
      NEW AL-SHIFA
      </h2>
      <Card
        title="Login"
        style={{
          width: 400,
          borderRadius: borderRadiusLG,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Form
          name="login"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Please input your Email!',
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Login
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="link" block onClick={() => navigate('/signup')}>
              If you are new, Sign Up
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 