'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

// Define the structure for form data
interface ProductFormData {
    name: string;
    description: string;
    price: string; // Use string for input, convert to number on submit
    inventory_count: string; // Use string for input, convert to number on submit
    is_active: boolean;
    drop_scheduled_time: string; // ISO string format from datetime-local
}

const NewProductPage: React.FC = () => {
    const { user, profile, loading: authLoading, session } = useAuth(); // Get session
    const router = useRouter();
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        inventory_count: '',
        is_active: true,
        drop_scheduled_time: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // --- Authorization Check ---
    useEffect(() => {
        // If auth is done loading and user is not logged in or not an admin, redirect
        if (!authLoading && (!user || profile?.role !== 'ADMIN')) {
            console.warn('Access denied: User not admin or not logged in.');
            router.push('/'); // Redirect to home page or a dedicated 'unauthorized' page
        }
    }, [user, profile, authLoading, router]);

    // --- Form Input Handling ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            // Handle checkbox input
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            // Handle text, number, textarea, datetime-local inputs
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Image File Handling ---
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        // Ensure session and token exist before proceeding
        if (!session?.access_token) {
            setError('Authentication token not found. Please log in again.');
            setIsSubmitting(false);
            return;
        }
        const accessToken = session.access_token;

        let imageUrl: string | null = null;

        try {            // --- Step 1: Upload Image (if selected) ---
            if (selectedFile) {                // Create form data for the file upload
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('filename', selectedFile.name);
                  // Debug logging before sending
                console.log('Uploading file:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size);
                
                // Send the file directly to our API (server-side upload to avoid CORS)
                const uploadApiResponse = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}` // Add Authorization header
                        // Do NOT set Content-Type manually - browser will set it with correct boundary
                    },
                    body: formData // Send the FormData with the file
                });
                
                console.log('Upload response status:', uploadApiResponse.status);
                
                if (!uploadApiResponse.ok) {
                    // Try to get the full response text for better error diagnosis
                    const responseText = await uploadApiResponse.text();
                    let errorMessage;
                    
                    try {
                        // Attempt to parse as JSON
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error || 'Unknown error';
                    } catch (e) {
                        // If not JSON, use the raw text
                        errorMessage = responseText || uploadApiResponse.statusText;
                        console.error('Non-JSON error response:', responseText);
                    }
                    
                    throw new Error(`Failed to upload image (${uploadApiResponse.status}): ${errorMessage}`);
                }

                const { publicUrl } = await uploadApiResponse.json();
                imageUrl = publicUrl; // Store the final public URL
                
                console.log('Image uploaded successfully:', publicUrl);
            }

            // --- Step 2: Create Product in Database ---
            const productPayload = {
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price), // Convert string to number
                inventory_count: parseInt(formData.inventory_count, 10), // Convert string to integer
                is_active: formData.is_active,
                drop_scheduled_time: formData.drop_scheduled_time || null, // Use null if empty
                image_urls: imageUrl ? [imageUrl] : null, // Send as array or null
            };

            // Basic client-side validation before sending
            if (isNaN(productPayload.price) || productPayload.price < 0) {
                throw new Error('Invalid price entered.');
            }
            if (isNaN(productPayload.inventory_count) || productPayload.inventory_count < 0) {
                throw new Error('Invalid inventory count entered.');
            }
            if (productPayload.drop_scheduled_time && isNaN(Date.parse(productPayload.drop_scheduled_time))) {
                throw new Error('Invalid date format for drop schedule.');
            }

            const createProductResponse = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` // Add Authorization header
                },
                body: JSON.stringify(productPayload),
            });

            if (!createProductResponse.ok) {
                const errorData = await createProductResponse.json().catch(() => ({})); // Gracefully handle non-JSON errors
                throw new Error(`Failed to create product: ${errorData.error || createProductResponse.statusText}`);
            }

            const newProduct = await createProductResponse.json();
            setSuccessMessage(`Product "${newProduct.name}" created successfully!`);

            // --- Step 3: Reset Form ---
            setFormData({
                name: '', description: '', price: '', inventory_count: '',
                is_active: true, drop_scheduled_time: ''
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            // Optionally redirect: router.push('/admin/products');

        } catch (err: any) {
            console.error("Submission Error:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (authLoading) {
        return <div className="text-center py-10">Loading authentication...</div>;
    }

    // Although useEffect handles redirection, this prevents rendering the form briefly if not admin
    if (!user || profile?.role !== 'ADMIN') {
        return <div className="text-center py-10 text-red-600">Access Denied. Admin privileges required.</div>;
    }

    // --- Form JSX ---
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Price */}
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Inventory Count */}
                <div>
                    <label htmlFor="inventory_count" className="block text-sm font-medium text-gray-700 mb-1">Inventory Count <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="inventory_count"
                        name="inventory_count"
                        value={formData.inventory_count}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1" // Ensure integer input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/png, image/jpeg, image/gif, image/webp" // Specify acceptable image types
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {previewUrl && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700">Image Preview:</p>
                            <div className="mt-2 border rounded p-2 inline-block">
                                {/* Using img instead of Image to avoid build complexity with remote domains */}
                                <img src={previewUrl} alt="Image preview" className="h-32 object-contain" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Is Active */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Product is Active</label>
                </div>

                {/* Drop Scheduled Time */}
                <div>
                    <label htmlFor="drop_scheduled_time" className="block text-sm font-medium text-gray-700 mb-1">Scheduled Drop Time (Optional)</label>
                    <input
                        type="datetime-local"
                        id="drop_scheduled_time"
                        name="drop_scheduled_time"
                        value={formData.drop_scheduled_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank if the product should be available immediately (if active).</p>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting || authLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Product...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProductPage;