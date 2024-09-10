'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Blog {
  _id: string;
  imgURL: string;
  title: string;
  category: string;
  description: string;
  user: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        // router.push('/login'); // Redirect to login page
        return;
      }

      try {
        const response = await axios.get('https://service.apikeeda.com/api/v1/blog', {
          headers: {
            'x-apikeeda-key': process.env.NEXT_PUBLIC_APIKEEDA_KEY || '',
            'authorization': `Bearer ${token}`,
          },
        });

        if (response.data.status === 'Success') {
          setBlogs(response.data.data);
        } else {
          setError('Failed to fetch blogs: ' + response.data.message);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            console.error('Unauthorized access');
            localStorage.removeItem('authToken'); 
            // router.push('/login'); 
          } else {
            setError(err.response?.data?.message || 'An error occurred while fetching blogs');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    // router.push('/login');
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
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div key={blog._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.imgURL}
                      alt={blog.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{blog.description}</p>
                    <Link 
                      href={`/dashboard/blogs/${blog._id}`}
                      className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {blogs.length === 0 && !error && (
              <p className="text-center text-gray-500 mt-4">No blogs found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}