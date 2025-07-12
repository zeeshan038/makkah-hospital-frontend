import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Typography, Spin, Alert, Tag, Divider } from "antd";
import { BASE_URL } from "../../constant";

const { Title } = Typography;

const columns = [
  {
    title: "Sale Date",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) =>
      date
        ? new Date(date).toLocaleString("en-PK", {
            timeZone: "Asia/Karachi",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "",
  },
  {
    title: "Items",
    dataIndex: "items",
    key: "items",
    render: (items) =>
      items && items.length ? (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {items.map((item, idx) => (
            <li key={item._id || idx}>
              {item.medicineId?.name} (x{item.quantitySold}) - Rs. {item.sellingPrice}
            </li>
          ))}
        </ul>
      ) : (
        "-"
      ),
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (amount) => (amount ? `Rs. ${amount}` : "-"),
  },
  {
    title: "Discount",
    dataIndex: "discount",
    key: "discount",
    render: (discount) => (discount ? `${discount}%` : "-"),
  },
  {
    title: "Final Total",
    dataIndex: "finalTotal",
    key: "finalTotal",
    render: (total) => (total ? `Rs. ${total}` : "-"),
  },
  {
    title: "Profit",
    dataIndex: "totalProfit",
    key: "totalProfit",
    render: (profit) => (profit ? `Rs. ${profit}` : "-"),
  },
];

const SpecificPatient = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/api/patient/patient/${id}`);
        const data = await res.json();
        if (!data.status) throw new Error(data.msg || "Not found");
        setPatient(data.getPatientById);
      } catch (err) {
        setError(err.message || "Failed to fetch patient");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "40px auto" }} />;
  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 32 }} />;
  if (!patient) return null;

  // Get all unique medicine names
  const medicineNames = Array.from(
    new Set(
      (patient.sales || [])
        .flatMap(sale => (sale.items || []).map(item => item.medicineId?.name))
        .filter(Boolean)
    )
  );

  return (
    <div style={{ maxWidth: 1200, minWidth: 900, margin: "0 auto", padding: 24 }}>
      <Title level={3} style={{ marginBottom: 16 }}>Patient Details</Title>
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          <div style={{ minWidth: 220 }}>
            <b>MIT ID:</b> <span>{patient.MITId}</span>
          </div>
          <div style={{ minWidth: 220 }}>
            <b>Name:</b> <span>{patient.name}</span>
          </div>
          <div style={{ minWidth: 220 }}>
            <b>Created At:</b> <span>{new Date(patient.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</span>
          </div>
          <div style={{ minWidth: 220 }}>
            <b>Total Sales:</b> <span>{patient.sales?.length || 0}</span>
          </div>
        </div>
      </Card>
      <Divider orientation="left" style={{ margin: '32px 0 16px 0' }}>
        <b>Medicines Bought</b>
      </Divider>
      <div style={{ marginBottom: 24 }}>
        {medicineNames.length ? (
          medicineNames.map(name => (
            <Tag color="blue" key={name} style={{ marginBottom: 8 }}>{name}</Tag>
          ))
        ) : (
          <span style={{ color: '#999' }}>No medicines bought yet.</span>
        )}
      </div>
      <Divider orientation="left" style={{ margin: '32px 0 16px 0' }}>
        <b>Sales History</b>
      </Divider>
      <Table
        columns={columns}
        dataSource={patient.sales || []}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        style={{ background: '#fff', borderRadius: 8, minWidth: 900 }}
        scroll={{ x: 1100 }}
      />
    </div>
  );
};

export default SpecificPatient;
