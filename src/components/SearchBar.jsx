import React, { useState, useEffect, useRef } from 'react';

const SearchBar = React.memo(({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const inputRef = useRef(null);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); 

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Call onSearch prop with debounced term
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search medicines..."
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
});

export default SearchBar; 