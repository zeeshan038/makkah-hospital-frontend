import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-hot-toast';
import { BASE_URL } from "../../constant";

const Pos = () => {
  // ...existing state
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptMitId, setReceiptMitId] = useState("");
  // Sehat Card
  const [isSehatCard, setIsSehatCard] = useState(false);
  const [sehatModalOpen, setSehatModalOpen] = useState(false);
  const [sehatCardNumber, setSehatCardNumber] = useState("");
  const [sehatCardName, setSehatCardName] = useState("");

  // MIT search state
  const [mitId, setMitId] = useState("");

  // Print after receipt is ready
  useEffect(() => {
    if (showReceipt) {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [showReceipt]);
  const [mitResult, setMitResult] = useState(null);
  const [mitLoading, setMitLoading] = useState(false);
  const [mitError, setMitError] = useState("");
  const debounceRef = useRef();
  // Store selected MIT for sale
  const [selectedMit, setSelectedMit] = useState(null);
  console.log("selectedMit", selectedMit)

  const handleMitIdChange = (e) => {
    setMitId(e.target.value);
    setMitError("");
    setMitResult(null);
  };

  // Debounced search
  useEffect(() => {
    if (!mitId) {
      setMitResult(null);
      setMitError("");
      return;
    }
    setMitLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMitData();
    }, 600);
    // eslint-disable-next-line
  }, [mitId]);

  const fetchMitData = async () => {
    if (!mitId) return;
    setMitLoading(true);
    setMitError("");
    try {
      const res = await fetch(
        `${BASE_URL}/api/sale/search-mit?query=${encodeURIComponent(mitId)}`
      );
      console.log("res", res);
      if (!res.ok) throw new Error("No MIT found");
      const data = await res.json();
      setMitResult(data);
    } catch (err) {
      setMitResult(null);
      setMitError(err.message || "Error searching MIT");
    } finally {
      setMitLoading(false);
    }
  };

  // Medicine search and cart state
  const [medicineQuery, setMedicineQuery] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineQty, setMedicineQty] = useState(1);
  const medicineDebounceRef = useRef();
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [patientName, setPatientName] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  

console.log(showReceipt)

  // Show only receipt and print
  const handlePrintReceipt = () => {
    setShowReceipt(true);
    setTimeout(() => {
      window.print();
      setShowReceipt(false);
    }, 100);
  };

  useEffect(() => {
    if (!medicineQuery) {
      setMedicineResults([]);
      setMedicineError("");
      setSelectedMedicine(null);
      return;
    }
    setMedicineLoading(true);
    if (medicineDebounceRef.current) clearTimeout(medicineDebounceRef.current);
    medicineDebounceRef.current = setTimeout(() => {
      fetchMedicineData();
    }, 600);
  }, [medicineQuery]);

  const fetchMedicineData = async () => {
    if (!medicineQuery) return;
    setMedicineLoading(true);
    setMedicineError("");
    try {
      const res = await fetch(`${BASE_URL}/api/sale/search-med?query=${encodeURIComponent(medicineQuery)}`);
      console.log("Search status:", res.status);
      let data = null;
      try {
        data = await res.json();
        console.log("Search data:", data);
      } catch (jsonErr) {
        console.log("Failed to parse JSON:", jsonErr);
      }
      if (!res.ok) {
        setMedicineError(`API error: ${res.status} ${res.statusText}`);
        setMedicineResults([]);
        return;
      }
      if (!data || !Array.isArray(data.medicines)) {
        setMedicineError("Unexpected API response structure");
        setMedicineResults([]);
        return;
      }
      setMedicineResults(data.medicines);
    } catch (err) {
      setMedicineResults([]);
      setMedicineError(err.message || "Error searching medicine");
      console.log("Search fetch error:", err);
    } finally {
      setMedicineLoading(false);
    }
  };

  // When user selects a medicine from dropdown
  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setMedicineQuery(med.name);
    setMedicineResults([]);
    setMedicineError("");
  };

  // Add selected medicine to cart
  const handleAddToCart = () => {
    if (!selectedMedicine || !medicineQty || medicineQty < 1) return;
    const qtyToAdd = Number(medicineQty);
    const existing = cart.find(item => item.medicineId === selectedMedicine._id);
    const alreadyInCart = existing ? existing.quantity : 0;
    const available = selectedMedicine.totalQuantity || 0;
    if (qtyToAdd + alreadyInCart > available) {
      toast.error(`Cannot add more than available stock (${available}) for ${selectedMedicine.name}`);
      return;
    }
    if (existing) {
      // Update quantity if already in cart
      setCart(cart.map(item => item.medicineId === selectedMedicine._id ? {
        ...item,
        quantity: item.quantity + qtyToAdd
      } : item));
    } else {
      setCart([
        ...cart,
        {
          medicineId: selectedMedicine._id,
          name: selectedMedicine.name,
          brand: selectedMedicine.brand,
          quantity: qtyToAdd,
          price: selectedMedicine.price || 0,
          totalQuantity: selectedMedicine.totalQuantity || 0
        }
      ]);
    }
    setMedicineQuery("");
    setMedicineResults([]);
    setSelectedMedicine(null);
    setMedicineQty(1);
  };


  // Remove item from cart
  const handleRemoveFromCart = (medicineId) => {
    setCart(cart.filter(item => item.medicineId !== medicineId));
  };

  // Calculate total
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * (item.price || 0), 0);
  const discountedTotal = totalAmount - (Number(discount) || 0);
  const balance = (Number(amountPaid) || 0) - discountedTotal;

  // Sale submit handler
  const handleConfirmPayment = async () => {
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
  
    if (!patientName) {
      setSubmitError("Please select patient name");
      setSubmitting(false);
      return;
    }

    // If Sehat Card is selected, require details
    if (isSehatCard && (!sehatCardNumber || !sehatCardName)) {
      setSubmitError("Enter Sehat Card number and name");
      setSehatModalOpen(true);
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        patientName,
        discount: Number(discount) || 0,
        medicines: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          sellingPrice: item.price
        })),
        ...(selectedMit?.MITId ? { MITId: selectedMit.MITId } : {}),
        isSehatCard: Boolean(isSehatCard),
        ...(isSehatCard ? { sehatCardNumber, sehatCardName } : {})
      };

      const res = await fetch(`${BASE_URL}/api/sale/sell-med`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("res", res);
      if (!res.ok) throw new Error("Sale failed");

      // --- MIT ID logic for receipt ---
      let mitIdForReceipt = selectedMit?.MITId;
      let apiData = null;
      if (!mitIdForReceipt) {
        try {
          apiData = await res.json();
          mitIdForReceipt = apiData.patientId || "";
        } catch (e) {
          mitIdForReceipt = ""; // fallback if response parsing fails
        }
      }
      setReceiptMitId(mitIdForReceipt || "");
      // --- END MIT ID logic ---

      setSubmitSuccess("Sale successful!");
      console.log("mitIdForReceipt", mitIdForReceipt);

      // ✅ Step 1: Show receipt
      setShowReceipt(true);

      // ✅ Step 2: Wait a bit and then print
      setTimeout(() => {
        window.print();

        // ✅ Step 3: Reset state after printing
        setCart([]);
        setAmountPaid("");
        setDiscount(0);
        setShowReceipt(false); // hide receipt again
      }, 300);

    } catch (err) {
      setSubmitError(err.message || "Error during sale");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <>
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen py-8 px-2 flex flex-col items-center">
      {/* POS Header */}
      <div className="w-full max-w-7xl bg-white rounded-t-2xl shadow-lg p-4 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-blue-600">🛒</span>
          <span className="text-2xl font-bold tracking-wide text-blue-700">MMC</span>
        </div>
        <div className="w-full max-w-3xl flex flex-col items-center mb-6">
          <label className="text-gray-700 text-sm font-semibold mb-1" htmlFor="mit-id">Search for MIT ID</label>
          <div className="w-full flex gap-2 relative">
            <input
              id="mit-id"
              className="border border-blue-200 rounded-lg px-4 py-2 w-full focus:outline-blue-400 shadow-sm"
              placeholder="Enter MIT ID..."
              value={mitId}
              onChange={handleMitIdChange}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 rounded-lg shadow"
              onClick={fetchMitData}
              type="button"
            >
              Search
            </button>
            {/* Absolute MIT result */}
            {mitResult && mitResult.patients && mitResult.patients.length > 0 && (
              <div className="absolute left-0 top-full mt-2 bg-gray-100 rounded p-2 w-full text-base text-left shadow border z-20">
                {mitResult.patients.map((mit, idx) => (
                  <div
                    key={mit.MITId + idx}
                    className={`px-3 py-2 hover:bg-blue-100 cursor-pointer rounded mb-1 ${selectedMit && selectedMit.MITId === mit.MITId ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setSelectedMit(mit);
                      setPatientName(mit.name || "");
                      setMitResult(null);
                    }}
                  >
                    {mit.MITId}
                  </div>
                ))}
              </div>
            )}
          </div>
          {mitLoading && <div className="text-blue-500 mt-2">Searching...</div>}
          {mitError && <div className="text-red-500 mt-2">{mitError}</div>}
        </div>
      </div>

      {/* Main POS Two-Column Layout */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Left: Product/Medicine Entry and Cart */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Product Entry Form */}
          <div className="bg-white shadow-xl p-6 rounded-3xl flex flex-col gap-5 border border-blue-50">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="text-xs font-semibold mb-2 text-blue-900">Patient Name</label>
                <input
                  className="border border-blue-200 rounded-lg px-4 py-2 font-semibold w-full focus:outline-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[250px]">
                <label className="text-xs font-semibold mb-2 text-blue-900">Search Medicine</label>
                <div className="relative w-full">
                  <input
                    className="border border-blue-200 rounded-lg px-4 py-2 w-full focus:outline-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100"
                    placeholder="Type medicine name or brand..."
                    value={medicineQuery}
                    onChange={e => {
                      setMedicineQuery(e.target.value);
                      setMedicineError("");
                      setSelectedMedicine(null);
                    }}
                  />
                  {/* Floating Dots Loader CSS */}
                  <style>
                    {`
                      @keyframes dotFlashing {
                        0% { background-color: #60a5fa; }
                        50%, 100% { background-color: #dbeafe; }
                      }
                      .dot-flashing {
                        height: 10px;
                        margin: 0 3px;
                        border-radius: 50%;
                        background-color: #60a5fa;
                        animation: dotFlashing 1s infinite linear alternate;
                      }
                      .dot-flashing span:nth-child(2) {
                        animation-delay: 0.2s;
                      }
                      .dot-flashing span:nth-child(3) {
                        animation-delay: 0.4s;
                      }
                    `}
                  </style>
                  {medicineLoading && (
                    <div className="absolute left-0 right-0 z-30 flex justify-center" style={{ top: '100%', marginTop: 8 }}>
                      <div className="dot-flashing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                  {medicineError && <span className="text-red-500 ml-2">{medicineError}</span>}
                  {/* Medicine search dropdown results */}
                  {(medicineResults.length > 0 || (!medicineLoading && medicineQuery)) && (
                    <div className="absolute left-0 top-full mt-2 bg-white rounded-xl border border-blue-200 w-full text-base text-left shadow-xl z-20 max-h-56 overflow-y-auto">
                      {medicineResults.length === 0 && !medicineLoading ? (
                        <div className="px-4 py-2 text-gray-400">No medicines found</div>
                      ) : (
                        medicineResults.map(med => (
                          <div
                            key={med._id}
                            className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer flex flex-col gap-1 border-b last:border-b-0 rounded-lg"
                            onClick={() => handleSelectMedicine(med)}
                            tabIndex={0}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-blue-800">{med.name}</span>
                              <span className="text-xs text-gray-500 ml-2">{med.brand || ""}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span>Stock: {med.totalQuantity}</span>
                              <span>Rs {med.price}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col w-24">
                <label className="text-xs font-semibold mb-2 text-blue-900">Qty</label>
                <input
                  className="border border-blue-200 rounded-lg px-4 py-2 w-full focus:outline-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={medicineQty}
                  onChange={e => setMedicineQty(e.target.value)}
                />
              </div>
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-8 py-2 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedMedicine || !medicineQty}
              >
                + Add
              </button>
            </div>
          </div>
          {/* Cart Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-3 py-2 font-semibold text-left">Medicine</th>
                  <th className="px-3 py-2 font-semibold text-left">Brand</th>
                  <th className="px-3 py-2 font-semibold text-center">Qty</th>
                  <th className="px-3 py-2 font-semibold text-center">Price</th>
                  <th className="px-3 py-2 font-semibold text-center">Amount</th>
                  <th className="px-3 py-2 font-semibold text-center">Total Stock</th>
                  <th className="px-3 py-2 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-gray-400">No medicines added</td></tr>
                ) : (
                  cart.map(item => (
                    <tr key={item.medicineId} className="border-b">
                      <td className="px-3 py-2 align-middle font-semibold text-left whitespace-nowrap">{item.name}</td>
                      <td className="px-3 py-2 align-middle text-xs text-gray-700 whitespace-nowrap">{item.brand}</td>
                      <td className="px-3 py-2 align-middle text-center">{item.quantity}</td>
                      <td className="px-3 py-2 align-middle text-center">{item.price}</td>
                      <td className="px-3 py-2 align-middle text-center">{item.quantity * item.price}</td>
                      <td className="px-3 py-2 align-middle text-center text-xs text-gray-500">{item.totalQuantity}</td>
                      <td className="px-3 py-2 align-middle text-center"><button className="ml-2 text-red-500 hover:text-red-700" onClick={() => handleRemoveFromCart(item.medicineId)} title="Remove"><span className="text-lg">✕</span></button></td>
                    </tr>
                  ))
                )
                }
              </tbody>
            </table>
          </div>
        </div>
        {/* RECEIPT SECTION - PRINT ONLY */}
        {showReceipt && (
       <div id="receipt-section" className="hidden print:block p-8 text-sm font-mono">
       <div className="text-center mb-2">
         <div className="font-extrabold text-lg">Makkah Hospital</div>
         <div className="text-xs">123 Main Road, City, Country</div>
       </div>
       <h2 className="text-center text-xl font-bold mb-4">PHARMACY RECEIPT</h2>
       <p>Patient: {patientName}</p>
       {receiptMitId && <p>MIT ID: {receiptMitId}</p>}
     
       <table className="w-full mt-4 border-t border-b border-black">
         <thead>
           <tr>
             <th className="text-left py-1">Medicine</th>
             <th className="text-center py-1">Qty</th>
             <th className="text-center py-1">Price</th>
             <th className="text-right py-1">Amount</th>
           </tr>
         </thead>
         <tbody>
           {cart.map((item) => (
             <tr key={item.medicineId}>
               <td>{item.name}</td>
               <td className="text-center">{item.quantity}</td>
               <td className="text-center">{item.price}</td>
               <td className="text-right">{item.quantity * item.price}</td>
             </tr>
           ))}
         </tbody>
       </table>
     
       <div className="mt-4 space-y-1">
         <div className="flex justify-between">
           <span>Total:</span>
           <span>Rs {totalAmount.toLocaleString()}</span>
         </div>
         <div className="flex justify-between">
           <span>Discount:</span>
           <span>Rs {discount}</span>
         </div>
         <div className="flex justify-between">
           <span>Paid:</span>
           <span>Rs {amountPaid}</span>
         </div>
         <div className="flex justify-between font-bold">
           <span>Balance:</span>
           <span>Rs {balance}</span>
         </div>
       </div>
     
       <p className="mt-6 text-center text-xs">Thank you for your purchase!</p>
     </div>
     
        )}
        {/* Right: Calculation/Payment Panel */}
        <div className="flex flex-col gap-4">
          {/* Large Total Display */}
          <div className="bg-black rounded-xl p-4 text-center mb-2">
            <div className="text-green-400 text-4xl font-bold">{discountedTotal.toLocaleString()}</div>
            <div className="text-green-300 text-sm mt-1">TOTAL AMOUNT DUE</div>
          </div>
          {/* Payment & Info Actions (no calculator) */}
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-blue-700 font-bold">Amt Paid</div>
              <input
                className="border rounded px-3 py-2 w-32 text-right font-semibold"
                placeholder="0.00"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-red-700 font-bold">Balance</div>
              <span className="text-right font-semibold">{balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-blue-700 font-bold">Discount</div>
              <input
                className="border rounded px-3 py-2 w-24 text-right font-semibold"
                placeholder="0"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                type="number"
                min="0"
              />
            </div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSehatCard}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsSehatCard(checked);
                    if (checked) setSehatModalOpen(true);
                  }}
                />
                <span className="font-semibold text-purple-700">Sehat Card</span>
              </label>
              {isSehatCard && (
                <button type="button" className="text-sm text-blue-600 underline" onClick={() => setSehatModalOpen(true)}>
                  Edit details
                </button>
              )}
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow mb-2"
              onClick={handleConfirmPayment}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "CONFIRM PAYMENT"}
            </button>
            {submitError && <div className="text-red-500 mb-2">{submitError}</div>}
            {submitSuccess && <div className="text-green-500 mb-2">{submitSuccess}</div>}
            <div className="flex gap-2">

              <button
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-lg shadow flex-1"
                onClick={handlePrintReceipt}
              >PRINT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Sehat Card Modal */}
    {sehatModalOpen && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">Sehat Card Details</h3>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Card Number</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={sehatCardNumber}
              onChange={(e) => setSehatCardNumber(e.target.value)}
              placeholder="Enter Sehat Card Number"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Card Holder Name</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={sehatCardName}
              onChange={(e) => setSehatCardName(e.target.value)}
              placeholder="Enter Name"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => {
                setSehatModalOpen(false);
                if (!sehatCardNumber && !sehatCardName) setIsSehatCard(false);
              }}
            >Cancel</button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() => {
                if (!sehatCardNumber || !sehatCardName) { toast.error('Please enter both number and name'); return; }
                setIsSehatCard(true);
                setSehatModalOpen(false);
              }}
            >Save</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Pos;
