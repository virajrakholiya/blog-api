'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import debounce from 'lodash/debounce';

interface Category {
  _id: string;
  name: string;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async (search: string = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = search
        ? `https://service.apikeeda.com/api/v1/category/search?search=${search}`
        : 'https://service.apikeeda.com/api/v1/category';
      
      const response = await axios.get(url, {
        headers: {
          'x-apikeeda-key': process.env.NEXT_PUBLIC_APIKEEDA_KEY || '',
          'authorization': token || '',
        },
      });

      if (response.data.status === 'Success') {
        setCategories(response.data.data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'An error occurred while fetching categories');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`https://service.apikeeda.com/api/v1/category/${id}`, {
        headers: {
          'x-apikeeda-key': process.env.NEXT_PUBLIC_APIKEEDA_KEY || '',
          'authorization': token || '',
        },
      });

      if (response.data.status === 'Success') {
        setCategories(categories.filter(category => category._id !== id));
      } else {
        setError('Failed to delete category');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'An error occurred while deleting the category');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Debounced version of fetchCategories
  const debouncedFetchCategories = useCallback(
    debounce((search: string) => fetchCategories(search), 300),
    []
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      debouncedFetchCategories(value);
    } else if (value.length === 0) {
      fetchCategories();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between mb-4">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Link href="/dashboard/AddCategory" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out">
                Add New Category
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{category.name}</h3>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
                    <Link 
                      href={`/dashboard/UpdateCategory/${category._id}`}
                      className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-center text-gray-500 mt-4">No categories found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
