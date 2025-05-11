// app/src/app/admin/products/manage/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import NextImage from 'next/image';

// Interfaces (some might be identical to new/page.tsx, consider sharing them)
interface Product {
    id: string;
    name: string;
    price: number;
    inventory_count: number;
    is_active: boolean;
    image_urls: string[] | null;
    created_at: string;
    // Add other relevant product fields if needed for display
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    inventory_count: string;
    is_active: boolean;
    drop_scheduled_time: string;
    categories: string[];
    collections: string[];
    sizes: string[];
    colors: string[];
}

interface Category { id: string; name: string; parent_id: string | null; }
interface Collection { id: string; name: string; }
interface ProductSize { id: string; name: string; display_name: string; }
interface ProductColor { id: string; name: string; display_name: string; hex_code: string | null; }

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred.';
};

const ManageProductsPage: React.FC = () => {
    const { user, profile, loading: authLoading, session } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

    // Form state for adding new product (similar to new/page.tsx)
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        inventory_count: '',
        is_active: true,
        drop_scheduled_time: '',
        categories: [],
        collections: [],
        sizes: [],
        colors: [],
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ sizeId: string; colorId: string; inventory: number; price: string }[]>([]);
    
    // Options for selects (categories, collections, etc.)
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
    const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // --- Authorization & Initial Data Fetch ---
    useEffect(() => {
        if (!authLoading && (!user || profile?.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [user, profile, authLoading, router]);

    const fetchProducts = useCallback(async () => {
        if (!user || profile?.role !== 'ADMIN') return;
        setLoadingProducts(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('products')
                .select('id, name, price, inventory_count, is_active, image_urls, created_at')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setProducts(data || []);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoadingProducts(false);
        }
    }, [user, profile]);

    // Fetch options for the "Add Product" modal form
    const fetchFormOptions = useCallback(async () => {
        if (!user || profile?.role !== 'ADMIN') return;
        setLoadingOptions(true);
        try {
            const [catRes, colRes, sizeRes, colorRes] = await Promise.all([
                supabase.from('categories').select('id, name, parent_id').eq('is_active', true).order('name'),
                supabase.from('collections').select('id, name').eq('is_active', true).order('name'),
                supabase.from('product_sizes').select('id, name, display_name').order('sort_order'),
                supabase.from('product_colors').select('id, name, display_name, hex_code').order('sort_order'),
            ]);
            if (catRes.error) throw catRes.error;
            setCategories(catRes.data || []);
            if (colRes.error) throw colRes.error;
            setCollections(colRes.data || []);
            if (sizeRes.error) throw sizeRes.error;
            setAvailableSizes(sizeRes.data || []);
            if (colorRes.error) throw colorRes.error;
            setAvailableColors(colorRes.data || []);
        } catch (err) {
            setError(prev => (prev ? prev + '\n' : '') + 'Failed to load form options: ' + getErrorMessage(err));
        } finally {
            setLoadingOptions(false);
        }
    }, [user, profile]);


    useEffect(() => {
        if (user && profile?.role === 'ADMIN') {
            fetchProducts();
            fetchFormOptions(); // Fetch options when admin is confirmed
        }
    }, [user, profile, fetchProducts, fetchFormOptions]);

    // --- Product Selection ---
    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
        }
    };

    // --- Delete Products ---
    const handleDeleteSelected = async () => {
        if (selectedProducts.length === 0) {
            setError('No products selected for deletion.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`)) {
            return;
        }

        setIsSubmittingProduct(true); // Use general submitting state
        setError(null);
        setSuccessMessage(null);

        try {
            // We need to call an API route that can handle cascading deletes or delete related records first.
            // For simplicity, let's assume an API route /api/admin/products/batch-delete
            
            if (!session?.access_token) throw new Error("Authentication token not found.");

            const response = await fetch('/api/admin/products/batch-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ productIds: selectedProducts }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to delete products (status: ${response.status})`);
            }

            setSuccessMessage(`${selectedProducts.length} product(s) deleted successfully.`);
            setSelectedProducts([]);
            fetchProducts(); // Refresh product list
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmittingProduct(false);
        }
    };

    // --- Add Product Modal Handlers (Simplified from new/page.tsx) ---
    const handleModalInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleModalCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, categories: selectedValues }));
    };

    const handleModalCollectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, collections: selectedValues }));
    };

    const updateModalVariantsFromSelections = useCallback((sizeIds: string[], colorIds: string[]) => {
        const newVariants: { sizeId: string; colorId: string; inventory: number; price: string }[] = [];
        if (sizeIds.length > 0 && colorIds.length > 0) {
            for (const sizeId of sizeIds) {
                for (const colorId of colorIds) {
                    const existingVariant = variants.find(v => v.sizeId === sizeId && v.colorId === colorId);
                    if (existingVariant) {
                        newVariants.push(existingVariant);
                    } else {
                        newVariants.push({
                            sizeId,
                            colorId,
                            inventory: 0,
                            price: formData.price || '0',
                        });
                    }
                }
            }
        }
        setVariants(newVariants);
    }, [variants, formData.price]);


    const handleModalSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, sizes: selectedValues }));
        if (hasVariants) {
            updateModalVariantsFromSelections(selectedValues, formData.colors);
        }
    };

    const handleModalColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, colors: selectedValues }));
        if (hasVariants) {
            updateModalVariantsFromSelections(formData.sizes, selectedValues);
        }
    };
    
    const handleModalVariantInventoryChange = (sizeId: string, colorId: string, inventory: number) => {
        setVariants(prev =>
            prev.map(variant =>
                variant.sizeId === sizeId && variant.colorId === colorId
                    ? { ...variant, inventory: Math.max(0, inventory) } 
                    : variant
            )
        );
    };

    const handleModalVariantPriceChange = (sizeId: string, colorId: string, price: string) => {
        setVariants(prev =>
            prev.map(variant =>
                variant.sizeId === sizeId && variant.colorId === colorId
                    ? { ...variant, price }
                    : variant
            )
        );
    };


    const handleModalFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
        e.target.value = ''; // Reset file input
    };

    const removeModalFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        if (previewUrls[index]) { // Check if URL exists before revoking
            URL.revokeObjectURL(previewUrls[index]);
        }
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    const resetAddProductForm = () => {
        setFormData({
            name: '', description: '', price: '', inventory_count: '',
            is_active: true, drop_scheduled_time: '', categories: [],
            collections: [], sizes: [], colors: [],
        });
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url)); // Clean up all preview URLs
        setPreviewUrls([]);
        setVariants([]);
        setHasVariants(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handleAddProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmittingProduct(true);
        setError(null);
        setSuccessMessage(null);

        if (!session?.access_token) {
            setError('Authentication token not found. Please log in again.');
            setIsSubmittingProduct(false);
            return;
        }
        const accessToken = session.access_token;

        try {
            const imageUrls: string[] = [];
            for (const file of selectedFiles) {
                const imageApiFormData = new FormData();
                imageApiFormData.append('file', file);
                imageApiFormData.append('filename', file.name);

                const uploadApiResponse = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: imageApiFormData
                });

                if (!uploadApiResponse.ok) {
                    const errorText = await uploadApiResponse.text();
                    throw new Error(`Failed to upload image: ${errorText}`);
                }
                const { publicUrl } = await uploadApiResponse.json();
                imageUrls.push(publicUrl);
            }

            const productPayload = {
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price),
                inventory_count: hasVariants ? 0 : parseInt(formData.inventory_count, 10) || 0,
                is_active: formData.is_active,
                drop_scheduled_time: formData.drop_scheduled_time || null,
                image_urls: imageUrls.length > 0 ? imageUrls : null,
                categories: formData.categories,
                collections: formData.collections,
                sizes: formData.sizes, 
                colors: formData.colors, 
                variants: hasVariants ? variants.map(v => ({
                    ...v,
                    price: parseFloat(v.price) || parseFloat(formData.price) || 0,
                    inventory: Number.isFinite(v.inventory) ? v.inventory : 0
                })) : null,
            };
            
            // Basic Validations
            if (isNaN(productPayload.price) || productPayload.price < 0) throw new Error('Invalid base price.');
            if (!hasVariants && (isNaN(productPayload.inventory_count) || productPayload.inventory_count < 0)) throw new Error('Invalid inventory count.');
            if (productPayload.drop_scheduled_time && isNaN(Date.parse(productPayload.drop_scheduled_time))) throw new Error('Invalid drop schedule date.');
            if (hasVariants && productPayload.variants) {
                for (const variant of productPayload.variants) {
                    if (isNaN(variant.price) || variant.price < 0) throw new Error(`Invalid price for variant.`);
                    if (isNaN(variant.inventory) || variant.inventory < 0) throw new Error(`Invalid inventory for variant.`);
                }
            }


            const createProductResponse = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(productPayload),
            });

            if (!createProductResponse.ok) {
                const errorData = await createProductResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create product: ${createProductResponse.statusText}`);
            }

            const newProduct = await createProductResponse.json();
            setSuccessMessage(`Product "${newProduct.name}" created successfully!`);
            resetAddProductForm();
            setIsAddModalOpen(false);
            fetchProducts(); // Refresh product list
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmittingProduct(false);
        }
    };


    // --- Render Logic ---
    if (authLoading) {
        return <div className="text-center py-10">Loading authentication...</div>;
    }
    if (!user || profile?.role !== 'ADMIN') {
        return <div className="text-center py-10 text-red-600">Access Denied. Admin privileges required.</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Manage Products</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded whitespace-pre-line">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                    <button
                        onClick={() => { resetAddProductForm(); setIsAddModalOpen(true); }}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md flex items-center transition duration-150 ease-in-out"
                        disabled={isSubmittingProduct}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Product
                    </button>
                </div>
                {selectedProducts.length > 0 && (
                    <button
                        onClick={handleDeleteSelected}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow-md flex items-center transition duration-150 ease-in-out"
                        disabled={isSubmittingProduct}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Selected ({selectedProducts.length})
                    </button>
                )}
            </div>

            {/* Products Table/Grid */}
            {loadingProducts ? (
                <div className="text-center py-10">Loading products...</div>
            ) : products.length === 0 ? (
                 <div className="text-center py-10 text-gray-500">No products found. Add your first product!</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        checked={selectedProducts.length === products.length && products.length > 0}
                                        onChange={handleSelectAll}
                                        disabled={isSubmittingProduct}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className={`${selectedProducts.includes(product.id) ? 'bg-indigo-50' : ''} hover:bg-gray-50 transition-colors`}>
                                    <td className="p-4">
                                        <input 
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                            disabled={isSubmittingProduct}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <NextImage
                                                src={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder-image.png'} // Ensure you have a placeholder
                                                alt={product.name}
                                                width={48}
                                                height={48}
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">BYN {product.price.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.inventory_count}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                       {/* Placeholder for future edit button - for now, direct link to edit page if it exists */}
                                       {/* <button onClick={() => router.push(`/admin/products/edit/${product.id}`)} className="text-indigo-600 hover:text-indigo-900">Edit</button> */}
                                       <span className="text-gray-400 italic text-xs">(Edit coming soon)</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
                            <button 
                                type="button" 
                                className="text-gray-500 hover:text-gray-700 transition-colors" 
                                onClick={() => { setIsAddModalOpen(false); resetAddProductForm(); }}
                                disabled={isSubmittingProduct}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        {/* Replicated Form from new/page.tsx - simplified for brevity, ensure all fields and logic are included */}
                        <form onSubmit={handleAddProductSubmit} className="space-y-6">
                            {/* Product Details Fields (Name, Desc, Price, etc.) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Product Name */}
                                    <div>
                                        <label htmlFor="modal_name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                                        <input type="text" id="modal_name" name="name" value={formData.name} onChange={handleModalInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSubmittingProduct || loadingOptions} />
                                    </div>
                                    {/* Description */}
                                    <div>
                                        <label htmlFor="modal_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea id="modal_description" name="description" rows={3} value={formData.description} onChange={handleModalInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSubmittingProduct || loadingOptions} />
                                    </div>
                                    {/* Price */}
                                    <div>
                                        <label htmlFor="modal_price" className="block text-sm font-medium text-gray-700 mb-1">Price (BYN) <span className="text-red-500">*</span></label>
                                        <input type="number" id="modal_price" name="price" value={formData.price} onChange={handleModalInputChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSubmittingProduct || loadingOptions} />
                                    </div>
                                     {/* Inventory Count - only shown if not using variants */}
                                    {!hasVariants && (
                                        <div>
                                            <label htmlFor="modal_inventory_count" className="block text-sm font-medium text-gray-700 mb-1">
                                                Inventory Count <span className="text-red-500">*</span>
                                            </label>
                                            <input type="number" id="modal_inventory_count" name="inventory_count" value={formData.inventory_count} onChange={handleModalInputChange} required={!hasVariants} min="0" step="1" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSubmittingProduct || loadingOptions} />
                                        </div>
                                    )}
                                    {/* Is Active */}
                                    <div className="flex items-center">
                                        <input type="checkbox" id="modal_is_active" name="is_active" checked={formData.is_active} onChange={handleModalInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" disabled={isSubmittingProduct || loadingOptions} />
                                        <label htmlFor="modal_is_active" className="ml-2 block text-sm text-gray-900">Product is Active</label>
                                    </div>
                                    {/* Drop Scheduled Time */}
                                    <div>
                                        <label htmlFor="modal_drop_scheduled_time" className="block text-sm font-medium text-gray-700 mb-1">Scheduled Drop Time</label>
                                        <input type="datetime-local" id="modal_drop_scheduled_time" name="drop_scheduled_time" value={formData.drop_scheduled_time} onChange={handleModalInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={isSubmittingProduct || loadingOptions} />
                                    </div>
                                </div>

                                {/* Right Column - Attributes */}
                                <div className="space-y-6">
                                    {/* Categories */}
                                    <div>
                                        <label htmlFor="modal_categories" className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                                        <select id="modal_categories" name="categories" multiple value={formData.categories} onChange={handleModalCategoryChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" size={3} disabled={isSubmittingProduct || loadingOptions}>
                                            {categories.map((category) => (<option key={category.id} value={category.id}>{category.parent_id ? '-- ' : ''}{category.name}</option>))}
                                        </select>
                                    </div>
                                    {/* Collections */}
                                    <div>
                                        <label htmlFor="modal_collections" className="block text-sm font-medium text-gray-700 mb-1">Collections</label>
                                        <select id="modal_collections" name="collections" multiple value={formData.collections} onChange={handleModalCollectionChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" size={3} disabled={isSubmittingProduct || loadingOptions}>
                                            {collections.map((collection) => (<option key={collection.id} value={collection.id}>{collection.name}</option>))}
                                        </select>
                                    </div>
                                    {/* Sizes */}
                                    <div>
                                        <label htmlFor="modal_sizes" className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
                                        <select id="modal_sizes" name="sizes" multiple value={formData.sizes} onChange={handleModalSizeChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" size={3} disabled={isSubmittingProduct || loadingOptions}>
                                            {availableSizes.map((size) => (<option key={size.id} value={size.id}>{size.display_name}</option>))}
                                        </select>
                                    </div>
                                    {/* Colors */}
                                    <div>
                                        <label htmlFor="modal_colors" className="block text-sm font-medium text-gray-700 mb-1">Available Colors</label>
                                        <select id="modal_colors" name="colors" multiple value={formData.colors} onChange={handleModalColorChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" size={3} disabled={isSubmittingProduct || loadingOptions}>
                                            {availableColors.map((color) => (<option key={color.id} value={color.id}>{color.display_name}</option>))}\
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {/* SVG Icon */}
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="modal_image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                <span>Upload images</span>
                                                <input id="modal_image-upload" name="images[]" type="file" multiple accept="image/*" onChange={handleModalFilesChange} className="sr-only" disabled={isSubmittingProduct || loadingOptions} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                </div>
                                {previewUrls.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div key={url + index} className="relative">
                                                <NextImage src={url} alt={`Preview ${index + 1}`} width={80} height={80} className="object-cover rounded border" />
                                                <button type="button" onClick={() => removeModalFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" disabled={isSubmittingProduct}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Variant Management */}
                             <div>
                                <div className="flex items-center mb-4">
                                    <input type="checkbox" id="modal_hasVariants" checked={hasVariants} onChange={(e) => { if (isSubmittingProduct) return; const checked = e.target.checked; setHasVariants(checked); if (checked) { updateModalVariantsFromSelections(formData.sizes, formData.colors); } else { setVariants([]); } }} className="h-4 w-4 text-indigo-600" disabled={isSubmittingProduct || loadingOptions} />
                                    <label htmlFor="modal_hasVariants" className="ml-2 block text-sm font-medium text-gray-700">Manage Inventory by Size/Color Variants</label>
                                </div>
                                {hasVariants && (
                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                        {formData.sizes.length === 0 || formData.colors.length === 0 ? (
                                            <p className="text-center text-amber-600 text-sm">Please select at least one size and one color.</p>
                                        ) : variants.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-4 gap-2 mb-2 font-medium text-sm">
                                                    <div>Size</div><div>Color</div><div>Inventory <span className="text-red-500">*</span></div><div>Price (BYN) <span className="text-red-500">*</span></div>
                                                </div>
                                                {variants.map((variant, index) => {
                                                    const size = availableSizes.find(s => s.id === variant.sizeId);
                                                    const color = availableColors.find(c => c.id === variant.colorId);
                                                    return (
                                                        <div key={`${variant.sizeId}-${variant.colorId}-${index}`} className="grid grid-cols-4 gap-2 items-center py-2 border-b last:border-b-0">
                                                            <div className="text-sm">{size?.display_name || 'N/A'}</div>
                                                            <div className="flex items-center text-sm">
                                                                {color?.hex_code && <div className="w-4 h-4 mr-2 rounded-full border" style={{ backgroundColor: color.hex_code }}></div>}
                                                                {color?.display_name || 'N/A'}
                                                            </div>
                                                            <div><input type="number" value={variant.inventory} onChange={(e) => handleModalVariantInventoryChange(variant.sizeId, variant.colorId, parseInt(e.target.value, 10) || 0)} min="0" required className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100" disabled={isSubmittingProduct} /></div>
                                                            <div><input type="number" value={variant.price} onChange={(e) => handleModalVariantPriceChange(variant.sizeId, variant.colorId, e.target.value)} min="0" step="0.01" required className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100" disabled={isSubmittingProduct} /></div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        ) : <p className="text-center text-gray-500 text-sm">No variants generated.</p>}
                                    </div>
                                )}
                            </div>

                            {/* Modal Submit Button */}
                            <div className="pt-4 border-t mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmittingProduct || loadingOptions || authLoading}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isSubmittingProduct ? 'Creating Product...' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                        {/* End Replicated Form */}
                    </div>
                </div>
            )}
            {/* <style jsx global>{`
                .input-class {
                    @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm;
                }
                .input-class-sm {
                     @apply px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100;
                }
            `}</style> */}
        </div>
    );
};

export default ManageProductsPage;
