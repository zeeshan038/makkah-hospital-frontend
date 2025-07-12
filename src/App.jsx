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

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/dashboard') ||location.pathname.startsWith('/patients')||location.pathname.startsWith('/admin/patient')|| location.pathname.startsWith('/inventory') || location.pathname.startsWith('/sales') || location.pathname.startsWith('/total-sales') || location.pathname.startsWith('/short-expirey') || location.pathname.startsWith('/expired') || location.pathname.startsWith('/signup') || location.pathname.startsWith('/login');

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Pos/>}/>
        <Route path='/medicine/:id' element={<SpecificMed />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        {/* admin  */}
        <Route path='/dashboard' element={
          
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
        
        } />
        <Route path='/inventory' element={
            <AdminLayout>
              <ViewInventory />
            </AdminLayout>
        } />
        <Route path='/inventory/:id' element={
            <AdminLayout>
              <SpecificInventory />
            </AdminLayout>
        } />
        <Route path='/inventory/add' element={
            <AdminLayout>
              <AddProduct />
            </AdminLayout>
          
        } />
        <Route path='/patients' element={
            <AdminLayout>
              <Patients/>
            </AdminLayout>
          
        } />
        <Route path="/admin/patient/:id" element={<AdminLayout><SpecificPatient /></AdminLayout>} />
        <Route path='/sales' element={
          
            <AdminLayout>
              <SalesReport />
            </AdminLayout>
          
        } />

        <Route path='/total-sales' element={
          
            <AdminLayout>
              <Sales />
            </AdminLayout>
          
        } />

        <Route path='/short-expirey' element={
            <AdminLayout>
              <ShortExpirey/>
            </AdminLayout> 
        } />
        <Route path='/expired' element={
            <AdminLayout>
              <Expired/>
            </AdminLayout>
        } />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
