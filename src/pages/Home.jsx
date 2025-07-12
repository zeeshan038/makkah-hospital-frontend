import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../constant';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// imports
import MedicineCardSkeleton from '../components/MedicineCardSkeleton';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const navigate = useNavigate();
  console.log("Home component rendered");
  const [medicines, setMedicines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const itemsPerPage = 8;

  const handleSearch = useCallback((term) => {
    setCurrentSearchTerm(term);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/api/medicine/get-all-med?page=${currentPage}&limit=${itemsPerPage}&name=${currentSearchTerm}`);
        setMedicines(response.data.medicines);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError(err);
        console.error("Error fetching medicines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [currentPage, currentSearchTerm]);

  const handleAddToCart = (medicine) => {
    const existingMedicine = selectedMedicines.find(m => m.medicineId === medicine._id);
    if (existingMedicine) {
      setSelectedMedicines(prev => prev.map(m => 
        m.medicineId === medicine._id 
          ? { ...m, quantity: m.quantity + 1 }
          : m
      ));
    } else {
      setSelectedMedicines(prev => [...prev, {
        medicineId: medicine._id,
        quantity: 1,
        sellingPrice: medicine.price,
        name: medicine.name
      }]);
    }
    toast.success('Medicine added to cart');
  };

  const handleRemoveFromCart = (medicineId) => {
    setSelectedMedicines(prev => prev.filter(m => m.medicineId !== medicineId));
    toast.success('Medicine removed from cart');
  };

  const handleUpdateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedMedicines(prev => prev.map(m => 
      m.medicineId === medicineId 
        ? { ...m, quantity: newQuantity }
        : m
    ));
  };

  const handleUpdatePrice = (medicineId, newPrice) => {
    if (newPrice < 0) return;
    setSelectedMedicines(prev => prev.map(m => 
      m.medicineId === medicineId 
        ? { ...m, sellingPrice: newPrice }
        : m
    ));
  };

  const handleSellMedicines = async () => {
    if (selectedMedicines.length === 0) {
      toast.error('Please add medicines to cart first');
      return;
    }

    setIsSelling(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/sale/sell-med`, {
        medicines: selectedMedicines.map(({ medicineId, quantity, sellingPrice }) => ({
          medicineId,
          quantity,
          sellingPrice
        }))
      });

      console.log("res", response);

      if (response.status == 200) {
        toast.success('Medicines sold successfully!', {
          duration: 2000,
          position: 'top-center',
          style: {
            background: '#4ade80',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        
        setSelectedMedicines([]);
        setShowCart(false);
        navigate('/');
      }
    } catch (err) {
      toast.error('Error selling medicines');
      console.error('Error selling medicines:', err);
    } finally {
      setIsSelling(false);
    }
  };

  const currentItems = medicines;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total price of selected medicines
  const totalPrice = selectedMedicines.reduce((sum, med) => sum + (med.quantity * med.sellingPrice), 0);

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      <Toaster />
      {/* Search Bar and Cart Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full sm:w-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
        >
          <span className="mr-2">Cart</span>
          {selectedMedicines.length > 0 && (
            <span className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center">
              {selectedMedicines.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full sm:w-80 md:w-96 bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Selected Medicines</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {selectedMedicines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No medicines selected</p>
            ) : (
              <>
                <div className="space-y-4">
                  {selectedMedicines.map((medicine) => (
                    <div key={medicine.medicineId} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm sm:text-base">{medicine.name}</h3>
                        <button
                          onClick={() => handleRemoveFromCart(medicine.medicineId)}
                          className="text-red-600 hover:text-red-800 text-sm sm:text-base"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={(() => {
                              const med = medicines.find(m => m._id === medicine.medicineId);
                              return med ? med.quantity : 1;
                            })()}
                            value={medicine.quantity}
                            onChange={(e) => {
                              const med = medicines.find(m => m._id === medicine.medicineId);
                              const maxQty = med ? med.quantity : 1;
                              let newQty = parseInt(e.target.value);
                              if (isNaN(newQty) || newQty < 1) newQty = 1;
                              if (newQty > maxQty) {
                                newQty = maxQty;
                                toast.error(`You have only ${maxQty} in stock. You cannot increase it further.`);
                              }
                              handleUpdateQuantity(medicine.medicineId, newQty);
                            }}
                            className="w-full p-1 border rounded text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Price (Rs.)</label>
                          <input
                            type="number"
                            min="0"
                            value={medicine.sellingPrice}
                            onChange={(e) => handleUpdatePrice(medicine.medicineId, parseInt(e.target.value))}
                            className="w-full p-1 border rounded text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total Price */}
                <div className="mt-4 mb-2 text-lg font-semibold text-center text-gray-800">
                  Total Price: Rs. {totalPrice}
                </div>
                <div className="mt-2">
                  <button
                    onClick={handleSellMedicines}
                    disabled={isSelling}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSelling ? 'Processing...' : 'Sell Medicines'}
                  </button>
                  <div className="mt-6 text-center">
                    <div className="font-bold text-lg text-blue-900 tracking-wide">Al Shifa Pharmacy</div>
                    <div className="text-gray-600 text-base font-mono">03159207853</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading/Error Messages */}
      {loading && <div className="text-center mt-4">Loading medicines...</div>}
      {error && <div className="text-center mt-4 text-red-500">Error loading medicines: {error.message || 'Unknown error'}</div>}

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <MedicineCardSkeleton key={index} />
          ))
        ) : !error && currentItems.length > 0 ? (
          currentItems.map(medicine => (
            <div key={medicine._id} className="bg-blue-50 mt-4 sm:mt-10 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 overflow-hidden text-center flex flex-col h-full">
              <div className="aspect-[16/9] relative max-h-[200px]">
                <img 
                  src={medicine.image}
                  alt={medicine.name}
                  className="w-full h-full object-cover rounded-t-xl"
                />
              </div>
              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate">{medicine.name}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow">{medicine.description}</p>
                <div className="mt-auto">
                  <p className="text-blue-700 font-extrabold text-base sm:text-lg mb-1">Rs: {medicine.price}</p>
                  <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center mb-3">
                    Quantity: {medicine.quantity}
                    {medicine.quantity > 0 ? (
                      <span className="ml-2 text-green-600">✔️ In Stock</span>
                    ) : (
                      <span className="ml-2 text-red-600">❌ Out of Stock</span>
                    )}
                  </p>
                  <button
                    onClick={() => handleAddToCart(medicine)}
                    disabled={medicine.quantity === 0}
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : !loading && !error && currentItems.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 mt-8">No medicines found.</div>
        ) : null}
      </div>

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-6 flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;