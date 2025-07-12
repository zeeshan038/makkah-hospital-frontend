import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constant';
import toast, { Toaster } from 'react-hot-toast';

const SpecificMed = () => {
    const { id } = useParams();
    const [medicine, setMedicine] = useState(null);
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        price: '',
        category: '',
        manufacturer: '',
        quantity: '1'
    });

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/medicine/get-med/${id}`);
                setMedicine(response.data.medicine);
                setBatch(response.data.batches);
                setFormData({
                    name: response.data.medicine.name,
                    description: response.data.medicine.description,
                    brand: response.data.medicine.brand,
                    price: response.data.medicine.price,
                    category: response.data.medicine.category,
                    manufacturer: response.data.medicine.manufacturer,
                    quantity: '1'
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

    const handleAddToBulkSell = () => {
        const newMedicine = {
            medicineId: id,
            quantity: parseInt(formData.quantity),
            sellingPrice: parseInt(formData.price)
        };
        setSelectedMedicines(prev => [...prev, newMedicine]);
        toast.success('Medicine added to bulk sell list');
    };

    const handleRemoveFromBulkSell = (index) => {
        setSelectedMedicines(prev => prev.filter((_, i) => i !== index));
    };

    const handleSellClick = (e) => {
        e.preventDefault();
        if (selectedMedicines.length === 0) {
            toast.error('Please add at least one medicine to sell');
            return;
        }
        setShowModal(true);
    };

    const handleConfirmSell = async () => {
        setIsSelling(true);
        try {
            const response = await axios.post(`${BASE_URL}/api/sale/sell-med`, {
                medicines: selectedMedicines
            });

            if (response.data.status) {
                // Refresh the medicine data after successful sale
                const updatedResponse = await axios.get(`${BASE_URL}/api/medicine/get-med/${id}`);
                setMedicine(updatedResponse.data.medicine);
                setBatch(updatedResponse.data.batches);
                setSelectedMedicines([]);
                setFormData(prev => ({
                    ...prev,
                    quantity: '1'
                }));

                toast.success('Successfully sold medicines!');
            }
        } catch (err) {
            toast.error('Error selling medicines!');
        } finally {
            setIsSelling(false);
            setShowModal(false);
        }
    };

    const handleCancelSell = () => {
        setShowModal(false);
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
                <div className="mb-6 sm:mb-8">
                    <img 
                        src={medicine.image}
                        alt={medicine.name}
                        className="w-full h-48 sm:h-64 object-contain rounded-lg shadow-lg"
                    />
                </div>

                {/* Medicine Details Form */}
                <form onSubmit={handleSellClick} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
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
                                disabled
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
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Selling Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md text-sm sm:text-base"
                                min="1"
                                max={batch?.[0]?.quantity || 0}
                            />
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-6 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleAddToBulkSell}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
                        >
                            Add to Bulk Sell
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base"
                            disabled={selectedMedicines.length === 0}
                        >
                            Sell Selected Medicines
                        </button>
                    </div>
                </form>

                {/* Selected Medicines List */}
                {selectedMedicines.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                        <h3 className="text-lg font-bold mb-4">Selected Medicines</h3>
                        <div className="space-y-2">
                            {selectedMedicines.map((med, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div>
                                        <span className="font-medium">{medicine.name}</span>
                                        <span className="text-gray-600 ml-2">
                                            (Qty: {med.quantity}, Price: Rs. {med.sellingPrice})
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromBulkSell(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Confirm Sale</h3>
                            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
                                Are you sure you want to sell {selectedMedicines.length} medicine(s)?
                            </p>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={handleCancelSell}
                                    disabled={isSelling}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSell}
                                    disabled={isSelling}
                                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                                >
                                    {isSelling ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecificMed;