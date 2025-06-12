'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext'; // Import authentication context

interface FormData {
  name: string;
  description: string;
  price: number;
  inventory_count: number;
  categories: string[];
  collections: string[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const { user, profile, session, loading: authLoading } = useAuth(); // Use authentication context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    inventory_count: 0,
    categories: [],
    collections: []
  });
  const [availableCategories, setAvailableCategories] = useState<{id: string, name: string}[]>([]);
  const [availableCollections, setAvailableCollections] = useState<{id: string, name: string}[]>([]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'ADMIN')) {
      console.warn('Access denied: User not admin or not logged in.');
      router.push('/signin');
    }
  }, [user, profile, authLoading, router]);

  // Fetch categories and collections when component mounts
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch categories
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('id, name');
        
        if (catError) throw catError;
        setAvailableCategories(categories || []);

        // Fetch collections
        const { data: collections, error: colError } = await supabase
          .from('collections')
          .select('id, name');
        
        if (colError) throw colError;
        setAvailableCollections(collections || []);
      } catch (err) {
        console.error('Error loading reference data:', err);
        setError('Failed to load categories or collections');
      }
    };

    fetchReferenceData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'inventory_count' ? parseFloat(value) : value
    }));
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const values: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      categories: values
    }));
  };
  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const values: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      collections: values
    }));
  };

  // Handle file selection
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
    e.target.value = ''; // Reset file input
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!session?.access_token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // Validate form
      if (!formData.name) throw new Error('Product name is required');
      if (formData.price <= 0) throw new Error('Price must be greater than zero');
      if (formData.inventory_count < 0) throw new Error('Inventory count cannot be negative');

      // Upload images if any
      const imageUrls: string[] = [];
      for (const file of selectedFiles) {
        const imageApiFormData = new FormData();
        imageApiFormData.append('file', file);
        imageApiFormData.append('filename', file.name);

        const uploadApiResponse = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
          body: imageApiFormData
        });

        if (!uploadApiResponse.ok) {
          const responseText = await uploadApiResponse.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(responseText) as { error?: string };
            errorMessage = errorData.error || 'Unknown error during image upload';
          } catch {
            errorMessage = responseText || uploadApiResponse.statusText;
          }
          throw new Error(`Failed to upload image (${uploadApiResponse.status}): ${errorMessage}`);
        }

        const { publicUrl } = await uploadApiResponse.json() as { publicUrl: string };
        imageUrls.push(publicUrl);
      }

      // Create product payload
      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        inventory_count: formData.inventory_count,
        is_active: true,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        categories: formData.categories,
        collections: formData.collections,
      };

      // Send request to create product
      const createProductResponse = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(productPayload),
      });

      if (!createProductResponse.ok) {
        const errorData = await createProductResponse.json().catch(() => ({})) as { error?: string };
        throw new Error(`Failed to create product: ${errorData.error || createProductResponse.statusText}`);
      }

      const { data } = await createProductResponse.json();
      
      // Redirect to the product detail page
      router.push(`/products/${data.id}`);
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'An error occurred while creating the product');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="text-center py-10">Loading authentication...</div>;
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <div className="text-center py-10 text-red-600">Access Denied. Admin privileges required. You will be redirected.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#24225c]">Создание нового товара</h1>
          <Link href="/products" className="text-[#76bfd4] hover:underline">
            Вернуться к товарам
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Название товара *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#76bfd4] focus:border-[#76bfd4]"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#76bfd4] focus:border-[#76bfd4]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Цена (BYN) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#76bfd4] focus:border-[#76bfd4]"
                required
              />
            </div>
            <div>
              <label htmlFor="inventory_count" className="block text-sm font-medium text-gray-700 mb-1">
                Количество на складе *
              </label>
              <input
                type="number"
                id="inventory_count"
                name="inventory_count"
                value={formData.inventory_count}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#76bfd4] focus:border-[#76bfd4]"
                required
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Изображения товара
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#76bfd4] hover:text-[#5a9eb0] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#76bfd4]">
                    <span>Загрузить изображения</span>
                    <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFilesChange} />
                  </label>
                  <p className="pl-1">или перетащите файлы</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP до 10МБ</p>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600 focus:outline-none"
                      aria-label="Удалить изображение"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                Категории
              </label>
              <select
                id="categories"
                name="categories"
                multiple
                size={4}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#76bfd4] focus:border-[#76bfd4]"
              >
                {availableCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl для выбора нескольких категорий</p>
            </div>
            <div>
              <label htmlFor="collections" className="block text-sm font-medium text-gray-700 mb-1">
                Коллекции
              </label>
              <select
                id="collections"
                name="collections"
                multiple
                size={4}
                onChange={handleCollectionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#76bfd4] focus:border-[#76bfd4]"
              >
                {availableCollections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl для выбора нескольких коллекций</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-4">* Обязательные поля</p>
            <div className="flex justify-end">
              <Link 
                href="/products" 
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md mr-2 hover:bg-gray-200 transition-colors duration-200"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#24225c] text-white py-2 px-4 rounded-md hover:bg-[#1a1943] transition-colors duration-200 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Создание...
                  </>
                ) : (
                  'Создать товар'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
