'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

// Define the structure for form data
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

// Interface for category, collection, size, and color data
interface Category {
    id: string;
    name: string;
    parent_id: string | null;
}

interface Collection {
    id: string;
    name: string;
}

interface ProductSize {
    id: string;
    name: string;
    display_name: string;
}

interface ProductColor {
    id: string;
    name: string;
    display_name: string;
    hex_code: string | null;
}

const NewProductPage: React.FC = () => {
    const { user, profile, loading: authLoading, session } = useAuth(); // Get session
    const router = useRouter();
    
    // Form data state
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
    
    // File uploads state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Available options from database
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
    const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);
    
    // Variants state
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{sizeId: string; colorId: string; inventory: number; price: string}[]>([]);

    // --- Authorization Check ---
    useEffect(() => {
        if (!authLoading && (!user || profile?.role !== 'ADMIN')) {
            console.warn('Access denied: User not admin or not logged in.');
            router.push('/');
        }
    }, [user, profile, authLoading, router]);

    // --- Fetch Categories, Collections, Sizes, and Colors ---
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('id, name, parent_id')
                    .eq('is_active', true)
                    .order('name');
                
                if (categoriesError) throw categoriesError;
                setCategories(categoriesData || []);
                
                // Fetch collections
                const { data: collectionsData, error: collectionsError } = await supabase
                    .from('collections')
                    .select('id, name')
                    .eq('is_active', true)
                    .order('name');
                
                if (collectionsError) throw collectionsError;
                setCollections(collectionsData || []);
                
                // Fetch sizes
                const { data: sizesData, error: sizesError } = await supabase
                    .from('product_sizes')
                    .select('id, name, display_name')
                    .order('sort_order');
                
                if (sizesError) throw sizesError;
                setAvailableSizes(sizesData || []);
                
                // Fetch colors
                const { data: colorsData, error: colorsError } = await supabase
                    .from('product_colors')
                    .select('id, name, display_name, hex_code')
                    .order('sort_order');
                
                if (colorsError) throw colorsError;
                setAvailableColors(colorsData || []);
                
            } catch (err: any) {
                console.error('Error fetching options:', err);
                setError('Failed to load form options');
            }
        };
        
        if (user && profile?.role === 'ADMIN') {
            fetchOptions();
        }
    }, [user, profile]);

    // --- Form Input Handling ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // Handle select for categories
    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues: string[] = [];
        
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        
        setFormData(prev => ({ ...prev, categories: selectedValues }));
    };
    
    // Handle select for collections
    const handleCollectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues: string[] = [];
        
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        
        setFormData(prev => ({ ...prev, collections: selectedValues }));
    };
    
    // Handle select for sizes
    const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues: string[] = [];
        
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        
        setFormData(prev => ({ ...prev, sizes: selectedValues }));
        
        // Update variants if hasVariants is true
        if (hasVariants) {
            updateVariantsFromSelections(selectedValues, formData.colors);
        }
    };
    
    // Handle select for colors
    const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues: string[] = [];
        
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        
        setFormData(prev => ({ ...prev, colors: selectedValues }));
        
        // Update variants if hasVariants is true
        if (hasVariants) {
            updateVariantsFromSelections(formData.sizes, selectedValues);
        }
    };
    
    // Update variants when sizes or colors change
    const updateVariantsFromSelections = (sizeIds: string[], colorIds: string[]) => {
        const newVariants: {sizeId: string; colorId: string; inventory: number; price: string}[] = [];
        
        // Create all combinations of selected sizes and colors
        for (const sizeId of sizeIds) {
            for (const colorId of colorIds) {
                // Check if this variant already exists
                const existingVariant = variants.find(v => v.sizeId === sizeId && v.colorId === colorId);
                
                if (existingVariant) {
                    // Keep existing inventory and price
                    newVariants.push(existingVariant);
                } else {
                    // Create new variant with default values
                    newVariants.push({
                        sizeId,
                        colorId,
                        inventory: 0,
                        price: formData.price, // Use the base price as default
                    });
                }
            }
        }
        
        setVariants(newVariants);
    };
    
    // Handle variant inventory changes
    const handleVariantInventoryChange = (sizeId: string, colorId: string, inventory: number) => {
        setVariants(prev => 
            prev.map(variant => 
                variant.sizeId === sizeId && variant.colorId === colorId 
                    ? { ...variant, inventory } 
                    : variant
            )
        );
    };
    
    // Handle variant price changes
    const handleVariantPriceChange = (sizeId: string, colorId: string, price: string) => {
        setVariants(prev => 
            prev.map(variant => 
                variant.sizeId === sizeId && variant.colorId === colorId 
                    ? { ...variant, price } 
                    : variant
            )
        );
    };

    // --- Image File Handling ---
    const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            
            // Create preview URLs
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };
    
    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]); // Clean up object URL
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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

        try {
            // Step 1: Upload Images (if selected)
            const imageUrls: string[] = [];
            
            for (const file of selectedFiles) {
                // Create form data for the file upload
                const formData = new FormData();
                formData.append('file', file);
                formData.append('filename', file.name);
                
                // Send the file to the API
                const uploadApiResponse = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                });
                
                if (!uploadApiResponse.ok) {
                    const responseText = await uploadApiResponse.text();
                    let errorMessage;
                    
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error || 'Unknown error';
                    } catch (e) {
                        errorMessage = responseText || uploadApiResponse.statusText;
                    }
                    
                    throw new Error(`Failed to upload image (${uploadApiResponse.status}): ${errorMessage}`);
                }

                const { publicUrl } = await uploadApiResponse.json();
                imageUrls.push(publicUrl);
            }

            // Step 2: Create Product in Database
            const productPayload = {
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price),
                inventory_count: hasVariants ? 0 : parseInt(formData.inventory_count, 10), // 0 if using variants
                is_active: formData.is_active,
                drop_scheduled_time: formData.drop_scheduled_time || null,
                image_urls: imageUrls.length > 0 ? imageUrls : null,
                categories: formData.categories,
                collections: formData.collections,
                sizes: formData.sizes,
                colors: formData.colors,
                variants: hasVariants ? variants : null,
            };

            // Basic client-side validation
            if (isNaN(productPayload.price) || productPayload.price < 0) {
                throw new Error('Invalid price entered.');
            }
            
            if (!hasVariants && (isNaN(productPayload.inventory_count) || productPayload.inventory_count < 0)) {
                throw new Error('Invalid inventory count entered.');
            }
            
            if (productPayload.drop_scheduled_time && isNaN(Date.parse(productPayload.drop_scheduled_time))) {
                throw new Error('Invalid date format for drop schedule.');
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
                throw new Error(`Failed to create product: ${errorData.error || createProductResponse.statusText}`);
            }

            const newProduct = await createProductResponse.json();
            setSuccessMessage(`Product "${newProduct.name}" created successfully!`);

            // Reset Form
            setFormData({
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
            setSelectedFiles([]);
            setPreviewUrls([]);
            setVariants([]);
            setHasVariants(false);

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

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
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

                        {/* Inventory Count - only shown if not using variants */}
                        {!hasVariants && (
                            <div>
                                <label htmlFor="inventory_count" className="block text-sm font-medium text-gray-700 mb-1">
                                    Inventory Count <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="inventory_count"
                                    name="inventory_count"
                                    value={formData.inventory_count}
                                    onChange={handleInputChange}
                                    required={!hasVariants}
                                    min="0"
                                    step="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        )}

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
                            <label htmlFor="drop_scheduled_time" className="block text-sm font-medium text-gray-700 mb-1">Scheduled Drop Time</label>
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
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Categories */}
                        <div>
                            <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                            <select
                                id="categories"
                                name="categories"
                                multiple
                                value={formData.categories}
                                onChange={handleCategoryChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                size={4}
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.parent_id ? '-- ' : ''}{category.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple categories.</p>
                        </div>

                        {/* Collections */}
                        <div>
                            <label htmlFor="collections" className="block text-sm font-medium text-gray-700 mb-1">Collections</label>
                            <select
                                id="collections"
                                name="collections"
                                multiple
                                value={formData.collections}
                                onChange={handleCollectionChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                size={4}
                            >
                                {collections.map((collection) => (
                                    <option key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple collections.</p>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
                            <select
                                id="sizes"
                                name="sizes"
                                multiple
                                value={formData.sizes}
                                onChange={handleSizeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                size={4}
                            >
                                {availableSizes.map((size) => (
                                    <option key={size.id} value={size.id}>
                                        {size.display_name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple sizes.</p>
                        </div>

                        {/* Colors */}
                        <div>
                            <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">Available Colors</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {availableColors.map((color) => (
                                    <div 
                                        key={color.id} 
                                        className={`w-6 h-6 rounded-full cursor-pointer border ${
                                            formData.colors.includes(color.id) ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-300'
                                        }`}
                                        style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                                        title={color.display_name}
                                        onClick={() => {
                                            const newColors = formData.colors.includes(color.id)
                                                ? formData.colors.filter(id => id !== color.id)
                                                : [...formData.colors, color.id];
                                            setFormData(prev => ({ ...prev, colors: newColors }));
                                            if (hasVariants) {
                                                updateVariantsFromSelections(formData.sizes, newColors);
                                            }
                                        }}
                                    ></div>
                                ))}
                            </div>
                            <select
                                id="colors"
                                name="colors"
                                multiple
                                value={formData.colors}
                                onChange={handleColorChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                size={4}
                            >
                                {availableColors.map((color) => (
                                    <option key={color.id} value={color.id}>
                                        {color.display_name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple colors or click color swatches above.</p>
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                    <span>Upload images</span>
                                    <input 
                                        id="image-upload" 
                                        name="images[]" 
                                        type="file" 
                                        multiple
                                        accept="image/png, image/jpeg, image/gif, image/webp"
                                        onChange={handleFilesChange}
                                        className="sr-only" 
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                        </div>
                    </div>
                    
                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h3>
                            <div className="flex flex-wrap gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={url} 
                                            alt={`Preview ${index + 1}`} 
                                            className="h-24 w-24 object-cover rounded border" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 text-white text-xs text-center py-1">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Variant Management */}
                <div>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="hasVariants"
                            checked={hasVariants}
                            onChange={(e) => {
                                setHasVariants(e.target.checked);
                                if (e.target.checked) {
                                    updateVariantsFromSelections(formData.sizes, formData.colors);
                                }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="hasVariants" className="ml-2 block text-sm font-medium text-gray-700">
                            Manage Inventory by Size/Color Variants
                        </label>
                    </div>

                    {hasVariants && formData.sizes.length > 0 && formData.colors.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Variant Inventory</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-4 gap-2 mb-2 font-medium text-gray-700">
                                    <div>Size</div>
                                    <div>Color</div>
                                    <div>Inventory</div>
                                    <div>Price Adjustment</div>
                                </div>
                                
                                {variants.map((variant, index) => {
                                    const size = availableSizes.find(s => s.id === variant.sizeId);
                                    const color = availableColors.find(c => c.id === variant.colorId);
                                    
                                    return (
                                        <div key={index} className="grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-200">
                                            <div>{size?.display_name || 'Unknown'}</div>
                                            <div className="flex items-center">
                                                {color?.hex_code && (
                                                    <div 
                                                        className="w-4 h-4 mr-2 rounded-full" 
                                                        style={{ backgroundColor: color.hex_code }}
                                                    ></div>
                                                )}
                                                {color?.display_name || 'Unknown'}
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    value={variant.inventory}
                                                    onChange={(e) => handleVariantInventoryChange(
                                                        variant.sizeId, 
                                                        variant.colorId, 
                                                        parseInt(e.target.value, 10) || 0
                                                    )}
                                                    min="0"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2">$</span>
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => handleVariantPriceChange(
                                                        variant.sizeId, 
                                                        variant.colorId, 
                                                        e.target.value
                                                    )}
                                                    step="0.01"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {variants.length === 0 && (
                                    <div className="py-4 text-center text-gray-500">
                                        Select at least one size and one color to create variants
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {hasVariants && (formData.sizes.length === 0 || formData.colors.length === 0) && (
                        <div className="mt-2 text-amber-600 text-sm">
                            Please select at least one size and one color to manage variants
                        </div>
                    )}
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
