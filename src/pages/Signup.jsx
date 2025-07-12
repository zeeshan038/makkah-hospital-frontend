import React, { useState } from 'react';
import { Form, Input, Button, Card, message, theme } from 'antd';
import axios from 'axios';
import { BASE_URL } from '../constant';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Signup = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/user/signup`, values);
      if (response.data.status) {
        toast.success(response.data.msg);
        toast.success("User registered successfully!")
        navigate('/login'); // Navigate to login page on successful signup
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error('Signup error:', error);
      toast.error(error.response?.data?.msg || 'An error occurred during signup.');
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
        title="Sign Up"
        style={{
          width: 400,
          borderRadius: borderRadiusLG,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Form
          name="signup"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your Username!',
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Please input a valid Email!',
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
              {
                min: 6,
                message: 'Password must be at least 6 characters long!',
              },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Sign Up
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="link" block onClick={() => navigate('/login')}>
              If you already have an account, Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;