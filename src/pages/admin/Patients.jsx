import React, { useEffect, useState } from "react";
import { Table, Typography, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../constant";

const { Title } = Typography;

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");

  // Fetch patients
  const fetchPatients = async (page = 1, pageSize = 10, searchTerm = "") => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/api/patient/patients?page=${page}&limit=${pageSize}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPatients(data.patients || []);
      setPagination({
        current: data.page || 1,
        pageSize,
        total: data.total || 0,
      });
    } catch (err) {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(pagination.current, pagination.pageSize, search);
    // eslint-disable-next-line
  }, [search]);

  // Table columns
  const columns = [
    {
      title: "MIT ID",
      dataIndex: "MITId",
      key: "MITId",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Created At",
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
      title: "Sales Count",
      dataIndex: "salesCount",
      key: "salesCount",
      render: (count) => count || 0,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/admin/patient/${record._id}`)}>
          View
        </Button>
      ),
    },
  ];

  // Handle page change
  const handleTableChange = (pagination) => {
    fetchPatients(pagination.current, pagination.pageSize, search);
  };

  // Handle search
  const onSearch = (value) => {
    setSearch(value.trim());
    fetchPatients(1, pagination.pageSize, value.trim());
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const onSearchClear = () => {
    setSearch("");
    fetchPatients(1, pagination.pageSize, "");
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div>
      <Title level={3}>Patients</Title>
      <Input.Search
        placeholder="Search by MIT ID or Name"
        allowClear
        enterButton
        value={search}
        onChange={e => setSearch(e.target.value)}
        onSearch={onSearch}
        style={{ maxWidth: 320, marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default Patients;