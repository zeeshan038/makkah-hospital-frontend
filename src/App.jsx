import React from 'react'
import './App.css'
import Navbar from './components/navbar'
import Home from './pages/Home'
import { Routes, Route, useLocation } from 'react-router-dom'
import SpecificMed from './pages/SpecificMed'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/admin/Dashboard'
import ViewInventory from './pages/admin/ViewInventory'
import AdminLayout from './components/AdminLayout'
import SpecificInventory from './pages/admin/SpecificInventory'
import AddProduct from './pages/admin/AddProduct'
import SalesReport from './pages/admin/SalesReport'
import Sales from './pages/admin/Sales'
import ShortExpirey from './pages/admin/ShortExpirey'
import Expired from './pages/admin/Expired'
import Signup from './pages/Signup'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import Pos from './pages/Pharmacy/Pos'
import Patients from './pages/admin/Patients'
import SpecificPatient from './pages/admin/SpecificPatient'
import DoctorPortal from './pages/doctor/DoctorPortal';

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/patients') || location.pathname.startsWith('/admin/patient') || location.pathname.startsWith('/inventory') || location.pathname.startsWith('/sales') || location.pathname.startsWith('/total-sales') || location.pathname.startsWith('/short-expirey') || location.pathname.startsWith('/expired') || location.pathname.startsWith('/signup') || location.pathname.startsWith('/login');

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={
          <PrivateRoute>
            <Pos />
          </PrivateRoute>
        } />
        <Route path='/doctor' element={<DoctorPortal />} />

        <Route path='/medicine/:id' element={<SpecificMed />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        {/* admin  */}
        <Route path='/dashboard' element={
          <PrivateRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/inventory' element={
          <PrivateRoute>
            <AdminLayout>
              <ViewInventory />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/inventory/:id' element={
          <PrivateRoute>
            <AdminLayout>
              <SpecificInventory />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/inventory/add' element={
          <PrivateRoute>
            <AdminLayout>
              <AddProduct />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/patients' element={
          <PrivateRoute>
            <AdminLayout>
              <Patients />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/patient/:id" element={
          <PrivateRoute>
            <AdminLayout>
              <SpecificPatient />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/sales' element={
          <PrivateRoute>
            <AdminLayout>
              <SalesReport />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/total-sales' element={
          <PrivateRoute>
            <AdminLayout>
              <Sales />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/short-expirey' element={
          <PrivateRoute>
            <AdminLayout>
              <ShortExpirey />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path='/expired' element={
          <PrivateRoute>
            <AdminLayout>
              <Expired />
            </AdminLayout>
          </PrivateRoute>
        } />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
