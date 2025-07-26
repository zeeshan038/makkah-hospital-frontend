import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../constant';
import toast, { Toaster } from 'react-hot-toast';
import { Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const AddProduct = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        price: '',
        category: '',
        manufacturer: '',
    });
    const [batchData, setBatchData] = useState({
        batchNumber: '',
        purchasePrice: '',
        quantity: '',
        expiryDate: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBatchInputChange = (e) => {
        const { name, value } = e.target;
        setBatchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        const uploadToastId = toast.loading('Uploading image...');

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            const uploadResponse = await axios.post(`${BASE_URL}/api/upload/image`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Image upload response:", uploadResponse);
            if (uploadResponse.status === 200 && uploadResponse.data.url) {
                const newImageUrl = uploadResponse.data.url;
                setFormData(prev => ({ ...prev, image: newImageUrl }));
                toast.success('Image uploaded successfully!', { id: uploadToastId });
            } else {
                toast.error(uploadResponse.data.msg || 'Image upload failed!', { id: uploadToastId });
                setSelectedFile(null); 
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            toast.error('Error uploading image!', { id: uploadToastId });
            setSelectedFile(null); 
        }
    };

    const handleCreateMedicine = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const dataToSend = { 
                ...formData, 
                price: parseInt(formData.price),
                // image is already updated in formData by handleImageFileChange
                batchNumber: batchData.batchNumber,
                purchasePrice: parseInt(batchData.purchasePrice),
                quantity: parseInt(batchData.quantity),
                expiryDate: batchData.expiryDate // Send as string, backend handles parsing
            };
            const response = await axios.post(`${BASE_URL}/api/medicine/create`, dataToSend);
            console.log("Add Product response:", response);

            if (response.data.status) {
                toast.success(response.data.msg || 'Medicine added successfully!');
                setFormData({
                    name: '', description: '', brand: '', price: '', 
                    category: '', manufacturer: '', image: ''
                });
                setBatchData({
                    batchNumber: '', purchasePrice: '', quantity: '', expiryDate: ''
                });
                setSelectedFile(null); // Clear selected file
                navigate('/inventory'); // Redirect to inventory list
            } else {
                toast.error(response.data.msg || 'Failed to add medicine!');
            }
        } catch (err) {
            console.error('Error adding medicine:', err);
            toast.error('Error adding medicine!');
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditImageClick = () => {
        fileInputRef.current.click();
    };

    // Bulk medicine upload state
    const [bulkMedicines, setBulkMedicines] = useState([]);
    const [bulkFile, setBulkFile] = useState(null);
    const [showBulkTable, setShowBulkTable] = useState(false);

    // Bulk medicine upload handler (parse and preview)
    const handleBulkMedicineUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBulkFile(file);
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        setBulkMedicines(results.data);
                        setShowBulkTable(true);
                    } else {
                        toast.error('No valid medicines found in file.');
                    }
                },
                error: (err) => {
                    toast.error('Error parsing file.');
                    console.error('PapaParse error:', err);
                }
            });
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                if (jsonData && jsonData.length > 0) {
                    setBulkMedicines(jsonData);
                    setShowBulkTable(true);
                } else {
                    toast.error('No valid medicines found in file.');
                }
            };
            reader.onerror = (err) => {
                toast.error('Error reading Excel file.');
                console.error('XLSX FileReader error:', err);
            };
            reader.readAsArrayBuffer(file);
        } else {
            toast.error('Unsupported file type. Please upload a CSV or Excel file.');
        }
        // allow re-uploading the same file
        e.target.value = '';
    };

    // Save bulk medicines (send file to API)
    const handleSaveBulkMedicines = async () => {
        if (!bulkFile) return toast.error('No file to upload!');
        const uploadToastId = toast.loading('Uploading bulk medicines...');
        const formData = new FormData();
        formData.append('file', bulkFile);
        try {
            const response = await axios.post(`${BASE_URL}/api/upload/bulk-medicine`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 200 && response.data.status) {
                toast.success(response.data.msg || 'Bulk medicines added successfully!', { id: uploadToastId });
                setBulkMedicines([]);
                setBulkFile(null);
                setShowBulkTable(false);
            } else {
                toast.error(response.data.msg || 'Bulk upload failed!', { id: uploadToastId });
            }
        } catch (err) {
            console.error('Bulk medicine upload error:', err);
            toast.error('Bulk upload failed!', { id: uploadToastId });
        }
    };


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleCreateMedicine} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Medicine</h2>

                    {/* Image Section */}
                    {/* <div className="mb-6 sm:mb-8 relative">
                        <img 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : (formData.image || 'https://via.placeholder.com/150')}
                            alt="Medicine Image"
                            className="w-full h-48 sm:h-64 object-contain rounded-lg shadow-lg"
                        />
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditImageClick}
                            className="absolute top-0 right-2 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full p-2 shadow-md"
                        />
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Manufacturer</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                            />
                        </div>
                        
                        {/* Batch Information Section */}
                        <div className="sm:col-span-2 mt-4">
                            <h3 className="text-lg font-bold mb-3">Batch Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Batch Number</label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        value={batchData.batchNumber}
                                        onChange={handleBatchInputChange}
                                        className="w-full p-2 border rounded-md text-sm sm:text-base"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Purchase Price</label>
                                    <input
                                        type="number"
                                        name="purchasePrice"
                                        value={batchData.purchasePrice}
                                        onChange={handleBatchInputChange}
                                        className="w-full p-2 border rounded-md text-sm sm:text-base"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={batchData.quantity}
                                        onChange={handleBatchInputChange}
                                        className="w-full p-2 border rounded-md text-sm sm:text-base"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={batchData.expiryDate}
                                        onChange={handleBatchInputChange}
                                        className="w-full p-2 border rounded-md text-sm sm:text-base"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2" style={{ display: 'none' }}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Upload Image</label>
                            <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                ref={fileInputRef}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                            />
                        </div>
                    </div>
                    {/* Bulk Medicines Preview Table */}
                    {showBulkTable && bulkMedicines.length > 0 && (
                        <div className="my-6">
                            <h3 className="text-lg font-bold mb-2">Bulk Medicines Preview</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            {Object.keys(bulkMedicines[0]).map((key) => (
                                                <th key={key} className="border px-2 py-1 bg-gray-100">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkMedicines.map((row, i) => (
                                            <tr key={i} className="odd:bg-gray-50">
                                                {Object.keys(bulkMedicines[0]).map((key) => (
                                                    <td key={key} className="border px-2 py-1">{row[key]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                    onClick={handleSaveBulkMedicines}
                                >
                                    Save Bulk Medicines
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                                    onClick={() => { setShowBulkTable(false); setBulkMedicines([]); setBulkFile(null); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        {/* Bulk Add Button */}
                        <input
                            type="file"
                            accept=".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            id="bulk-medicine-input"
                            style={{ display: 'none' }}
                            onChange={handleBulkMedicineUpload}
                        />
                        <button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
                            onClick={() => document.getElementById('bulk-medicine-input').click()}
                        >
                            Add Med in Bulk
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;