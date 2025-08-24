import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../constant';
import toast, { Toaster } from 'react-hot-toast';
import { Button, message, Modal, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const SpecificInventory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [medicine, setMedicine] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        price: '',
        sehatPrice: '',
        category: '',
        manufacturer: '',
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingBatch, setIsUpdatingBatch] = useState({});

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/medicine/get-med/${id}`);
                setMedicine(response.data.medicine);
                setBatches(response.data.batches.map(batch => ({
                    ...batch,
                    expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''
                })));
                setFormData({
                    name: response.data.medicine.name,
                    description: response.data.medicine.description,
                    brand: response.data.medicine.brand,
                    price: response.data.medicine.price,
                    sehatPrice: response.data.medicine.sehatPrice ?? '',
                    category: response.data.medicine.category,
                    manufacturer: response.data.medicine.manufacturer,
                    image: response.data.medicine.image || ''
                });
            } catch (err) {
                setError(err.message || 'Error fetching medicine details');
                toast.error('Error fetching medicine details');
            } finally {
                setLoading(false);
            }
        };

        fetchMedicine();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBatchInputChange = (batchId, e) => {
        const { name, value } = e.target;
        setBatches(prevBatches =>
            prevBatches.map(batch =>
                batch._id === batchId ? { ...batch, [name]: value } : batch
            )
        );
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
    
        try {
            // Create update data object without image if it's empty
            const updateData = {
                name: formData.name,
                description: formData.description,
                brand: formData.brand,
                price: parseInt(formData.price),
                ...(formData.sehatPrice !== '' ? { sehatPrice: parseInt(formData.sehatPrice) } : {}),
                category: formData.category,
                manufacturer: formData.manufacturer
            };

            // Only add image to update data if it exists
            if (formData.image) {
                updateData.image = formData.image;
            }

            const response = await axios.put(`${BASE_URL}/api/medicine/edit-med/${id}`, updateData);
            console.log("res", response);
            if (response.data.status) {
                toast.success(response.data.msg || 'Medicine updated successfully!');
                setMedicine(response.data.medicine);
                setFormData(prev => ({ ...prev, image: response.data.medicine.image }));
            } else {
                toast.error(response.data.msg || 'Failed to update medicine!');
            }
        } catch (err) {
            console.error('Error updating medicine:', err);
            toast.error('Error updating medicine!');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateBatch = async (batchId) => {
        setIsUpdatingBatch(prev => ({ ...prev, [batchId]: true }));
        const batchToUpdate = batches.find(b => b._id === batchId);
        if (!batchToUpdate) return;

        try {
            const response = await axios.put(`${BASE_URL}/api/medicine/edit-batch/${batchId}`, {
                batchNumber: batchToUpdate.batchNumber,
                purchasePrice: parseInt(batchToUpdate.purchasePrice),
                quantity: parseInt(batchToUpdate.quantity),
                expiryDate: batchToUpdate.expiryDate
            });

            if (response.data.status) {
                toast.success(response.data.msg || 'Batch updated successfully!');
            } else {
                toast.error(response.data.msg || 'Failed to update batch!');
            }
        } catch (err) {
            console.error('Error updating batch:', err);
            toast.error('Error updating batch!');
        } finally {
            setIsUpdatingBatch(prev => ({ ...prev, [batchId]: false }));
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${BASE_URL}/api/medicine/delete-med/${id}`);
            if (response.data.status) {
                toast.success(response.data.msg || 'Medicine deleted successfully!');
                navigate('/inventory');
            } else {
                toast.error(response.data.msg || 'Failed to delete medicine!');
            }
        } catch (err) {
            console.error('Error deleting medicine:', err);
            toast.error('Error deleting medicine!');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleEditImageClick = () => {
        fileInputRef.current.click();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center">Loading medicine details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!medicine) {
  return (
            <div className="container mx-auto p-4">
                <div className="text-center">Medicine not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <Toaster />
            <div className="max-w-4xl mx-auto">
                {/* Image Section */}
                {/* <div className="mb-6 sm:mb-8 relative">
                    <img 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : (formData.image || 'https://placehold.co/600x400?text=No+Image+Available')}
                        alt={formData.name}
                        className="w-full h-48 sm:h-64 object-contain rounded-lg shadow-lg"
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditImageClick}
                        className="absolute top-0 right-2 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full p-2 shadow-md"
                    />
                </div> */}

                {/* Medicine Details Edit Form */}
                <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Medicine Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Sehat Price (optional)</label>
                            <input
                                type="number"
                                name="sehatPrice"
                                value={formData.sehatPrice}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                placeholder="Enter Sehat Card price"
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
                    <div className="mt-4 sm:mt-6 flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Update Medicine'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm sm:text-base"
                            disabled={isDeleting}
                        >
                            Delete Medicine
                        </button>
                    </div>
                </form>

                {/* Batch Information Section */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Batch Information</h2>
                    {batches.length > 0 ? (
                        <div className="space-y-6">
                            {batches.map(batch => (
                                <div key={batch._id} className="border p-4 rounded-md shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Batch Number</label>
                                            <input
                                                type="text"
                                                name="batchNumber"
                                                value={batch.batchNumber}
                                                onChange={(e) => handleBatchInputChange(batch._id, e)}
                                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Purchase Price</label>
                                            <input
                                                type="number"
                                                name="purchasePrice"
                                                value={batch.purchasePrice}
                                                onChange={(e) => handleBatchInputChange(batch._id, e)}
                                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={batch.quantity}
                                                onChange={(e) => handleBatchInputChange(batch._id, e)}
                                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Expiry Date</label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={batch.expiryDate}
                                                onChange={(e) => handleBatchInputChange(batch._id, e)}
                                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            type="primary"
                                            onClick={() => handleUpdateBatch(batch._id)}
                                            loading={isUpdatingBatch[batch._id]}
                                            className="bg-green-600 hover:bg-green-700 text-white border-none"
                                        >
                                            {isUpdatingBatch[batch._id] ? 'Updating...' : 'Update Batch'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No batch information available.</p>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={showDeleteModal}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmLoading={isDeleting}
                okText="Yes, Delete"
                cancelText="No, Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this medicine? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default SpecificInventory;