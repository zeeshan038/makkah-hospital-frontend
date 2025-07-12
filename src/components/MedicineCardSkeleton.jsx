import React from 'react';

const MedicineCardSkeleton = () => {
  return (
    <div className="border rounded-lg shadow-md p-4 text-center animate-pulse">
      <div className="w-full h-40 bg-gray-300 mb-4 rounded-md"></div> {/* Image placeholder */}
      <div className="h-6 bg-gray-300 w-3/4 mx-auto mb-2 rounded"></div> {/* Title placeholder */}
      <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div> {/* Description line 1 */}
      <div className="h-4 bg-gray-300 w-5/6 mx-auto mb-2 rounded"></div> {/* Description line 2 */}
      <div className="h-4 bg-gray-300 w-1/3 mx-auto mb-1 rounded"></div> {/* Price placeholder */}
      <div className="h-4 bg-gray-300 w-1/2 mx-auto rounded"></div> {/* Quantity placeholder */}
    </div>
  );
};

export default MedicineCardSkeleton; 