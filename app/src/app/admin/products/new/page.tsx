// app\src\app\admin\products\new\page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NextImage from 'next/image'; // Renamed to avoid potential naming conflicts, standard practice.
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
    name:string;
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

// Define new attribute form interfaces
interface NewCategoryFormData {
    name: string;
    description: string | null; // Made description explicitly nullable to match usage
    parent_id: string | null;
}

interface NewCollectionFormData {
    name: string;
    description: string | null; // Made description explicitly nullable
}

interface NewSizeFormData {
    name: string;
    display_name: string;
}

interface NewColorFormData {
    name: string;
    display_name: string;
    hex_code: string;
}

// Union type for the different attribute form data structures
type AttributeModalFormData = NewCategoryFormData | NewCollectionFormData | NewSizeFormData | NewColorFormData;

// Helper function to get error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred.';
};


const NewProductPage: React.FC = () => {
    const { user, profile, loading: authLoading, session } = useAuth();
    const router = useRouter();

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
    const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);
    
    const [loadingOptions, setLoadingOptions] = useState(true);


    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ sizeId: string; colorId: string; inventory: number; price: string }[]>([]);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);

    const [newCategoryForm, setNewCategoryForm] = useState<NewCategoryFormData>({ name: '', description: null, parent_id: null });
    const [newCollectionForm, setNewCollectionForm] = useState<NewCollectionFormData>({ name: '', description: null });
    const [newSizeForm, setNewSizeForm] = useState<NewSizeFormData>({ name: '', display_name: '' });
    const [newColorForm, setNewColorForm] = useState<NewColorFormData>({ name: '', display_name: '', hex_code: '#000000' });

    const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
    const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
    const [isSubmittingSize, setIsSubmittingSize] = useState(false);
    const [isSubmittingColor, setIsSubmittingColor] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || profile?.role !== 'ADMIN')) {
            console.warn('Access denied: User not admin or not logged in.');
            router.push('/');
        }
    }, [user, profile, authLoading, router]);

    // --- Fetching Callbacks ---
    const fetchCategories = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('categories')
                .select('id, name, parent_id')
                .eq('is_active', true)
                .order('name');

            console.log('Fetched categories:', data); // Debugging log
            if (fetchError) throw fetchError;
            setCategories(data || []);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error('Error fetching categories:', err);
            setError(prev => (prev ? prev + "\n" : "") + 'Failed to refresh categories: ' + message);
        }
    }, []);

    const fetchCollections = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('collections')
                .select('id, name')
                .eq('is_active', true)
                .order('name');
            if (fetchError) throw fetchError;
            setCollections(data || []);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error('Error fetching collections:', err);
            setError(prev => (prev ? prev + "\n" : "") + 'Failed to refresh collections: ' + message);
        }
    }, []);

    const fetchProductSizes = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('product_sizes')
                .select('id, name, display_name')
                .order('sort_order');
            if (fetchError) throw fetchError;
            setAvailableSizes(data || []);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error('Error fetching sizes:', err);
            setError(prev => (prev ? prev + "\n" : "") + 'Failed to refresh sizes: ' + message);
        }
    }, []);

    const fetchProductColors = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('product_colors')
                .select('id, name, display_name, hex_code')
                .order('sort_order');
            if (fetchError) throw fetchError;
            setAvailableColors(data || []);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error('Error fetching colors:', err);
            setError(prev => (prev ? prev + "\n" : "") + 'Failed to refresh colors: ' + message);
        }
    }, []);
    
    useEffect(() => {
        const fetchAllOptions = async () => {
            if (user && profile?.role === 'ADMIN') {
                setLoadingOptions(true);
                setError(null); // Clear previous errors before fetching
                try {
                    await Promise.all([
                        fetchCategories(),
                        fetchCollections(),
                        fetchProductSizes(),
                        fetchProductColors(),
                    ]);
                } catch (err: unknown) {
                    // Errors are handled within individual fetch functions, but a general one can be set too
                    const message = getErrorMessage(err);
                    console.error('Error fetching initial options:', err);
                    setError('Failed to load one or more form options: ' + message + '. Please check console.');
                } finally {
                    setLoadingOptions(false);
                }
            }
        };
        fetchAllOptions();
    }, [user, profile, fetchCategories, fetchCollections, fetchProductSizes, fetchProductColors]);


    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, categories: selectedValues }));
    };

    const handleCollectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, collections: selectedValues }));
    };
    
    const updateVariantsFromSelections = useCallback((sizeIds: string[], colorIds: string[]) => {
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
                            price: formData.price || '0', // Default to base price or 0
                        });
                    }
                }
            }
        }
        setVariants(newVariants);
    }, [variants, formData.price]);


    const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, sizes: selectedValues }));
        if (hasVariants) {
            updateVariantsFromSelections(selectedValues, formData.colors);
        }
    };

    const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, colors: selectedValues }));
        if (hasVariants) {
            updateVariantsFromSelections(formData.sizes, selectedValues);
        }
    };

    const handleVariantInventoryChange = (sizeId: string, colorId: string, inventory: number) => {
        setVariants(prev =>
            prev.map(variant =>
                variant.sizeId === sizeId && variant.colorId === colorId
                    ? { ...variant, inventory: Math.max(0, inventory) } // Ensure non-negative
                    : variant
            )
        );
    };

    const handleVariantPriceChange = (sizeId: string, colorId: string, price: string) => {
        setVariants(prev =>
            prev.map(variant =>
                variant.sizeId === sizeId && variant.colorId === colorId
                    ? { ...variant, price }
                    : variant
            )
        );
    };

    const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
        e.target.value = ''; // Reset file input
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        if (!session?.access_token) {
            setError('Authentication token not found. Please log in again.');
            setIsSubmitting(false);
            return;
        }
        const accessToken = session.access_token;

        try {
            const imageUrls: string[] = [];
            for (const file of selectedFiles) {
                const imageApiFormData = new FormData(); // Renamed variable
                imageApiFormData.append('file', file);
                imageApiFormData.append('filename', file.name); // Assuming API uses this

                const uploadApiResponse = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: imageApiFormData
                });

                if (!uploadApiResponse.ok) {
                    const responseText = await uploadApiResponse.text();
                    let errorMessage;
                    try {
                        const errorData = JSON.parse(responseText) as { error?: string };
                        errorMessage = errorData.error || 'Unknown error during image upload';
                    } catch /* istanbul ignore next */ { // Removed unused parseErr
                        errorMessage = responseText || uploadApiResponse.statusText;
                    }
                    throw new Error(`Failed to upload image (${uploadApiResponse.status}): ${errorMessage}`);
                }
                const { publicUrl } = await uploadApiResponse.json() as { publicUrl: string };
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
                sizes: formData.sizes, // these are IDs
                colors: formData.colors, // these are IDs
                variants: hasVariants ? variants.map(v => ({
                    ...v,
                    price: parseFloat(v.price) || parseFloat(formData.price) || 0, // Parse variant price, fallback to base price or 0
                    inventory: Number.isFinite(v.inventory) ? v.inventory : 0
                })) : null,
            };

            if (isNaN(productPayload.price) || productPayload.price < 0) {
                throw new Error('Invalid base price entered.');
            }
            if (!hasVariants && (isNaN(productPayload.inventory_count) || productPayload.inventory_count < 0)) {
                throw new Error('Invalid inventory count entered.');
            }
            if (productPayload.drop_scheduled_time && isNaN(Date.parse(productPayload.drop_scheduled_time))) {
                throw new Error('Invalid date format for drop schedule.');
            }
            if (hasVariants && productPayload.variants) {
                for (const variant of productPayload.variants) {
                    if (isNaN(variant.price) || variant.price < 0) {
                        throw new Error(`Invalid price for variant (Size: ${variant.sizeId}, Color: ${variant.colorId}).`);
                    }
                     if (isNaN(variant.inventory) || variant.inventory < 0) {
                        throw new Error(`Invalid inventory for variant (Size: ${variant.sizeId}, Color: ${variant.colorId}).`);
                    }
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
                const errorData = await createProductResponse.json().catch(() => ({})) as { error?: string };
                throw new Error(`Failed to create product: ${errorData.error || createProductResponse.statusText}`);
            }

            const newProduct = await createProductResponse.json() as {name: string}; // Assuming newProduct has a name property
            setSuccessMessage(`Product "${newProduct.name}" created successfully!`);

            setFormData({
                name: '', description: '', price: '', inventory_count: '',
                is_active: true, drop_scheduled_time: '', categories: [],
                collections: [], sizes: [], colors: [],
            });
            setSelectedFiles([]);
            setPreviewUrls([]);
            setVariants([]);
            setHasVariants(false);

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("Submission Error:", err);
            setError(message || 'An unexpected error occurred during product submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAttribute = async <T extends AttributeModalFormData>(
        e: FormEvent<HTMLFormElement>,
        apiPath: string,
        payload: T, // Renamed from formState for clarity
        stateSetter: React.Dispatch<React.SetStateAction<T>>, // Renamed from setFormState
        setIsSubmittingAttribute: React.Dispatch<React.SetStateAction<boolean>>,
        fetchAttributeList: () => Promise<void>,
        attributeName: 'categories' | 'collections' | 'sizes' | 'colors',
        initialStateValues: T, // Renamed from resetFormValues
        successMsgPrefix: string
    ) => {
        e.preventDefault();
        if (!session?.access_token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }
        setIsSubmittingAttribute(true);
        setError(null); // Clear previous errors
        setSuccessMessage(null);

        try {
            const response = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) as { error?: string };
                throw new Error(errorData.error || `Failed to create ${attributeName.slice(0, -1)}`);
            }

            const newItem = await response.json() as { id: string; name?: string; display_name?: string }; // Basic type for newItem
            await fetchAttributeList(); // Refresh the list

            setFormData(prev => ({
                ...prev,
                [attributeName]: [...prev[attributeName], newItem.id]
            }));

            // If sizes or colors are updated, and variants are active, refresh variants
            if (hasVariants) {
                if (attributeName === 'sizes') {
                    updateVariantsFromSelections([...formData.sizes, newItem.id], formData.colors);
                } else if (attributeName === 'colors') {
                    updateVariantsFromSelections(formData.sizes, [...formData.colors, newItem.id]);
                }
            }
            
            stateSetter(initialStateValues);
            if (attributeName === 'categories') setIsCategoryModalOpen(false);
            if (attributeName === 'collections') setIsCollectionModalOpen(false);
            if (attributeName === 'sizes') setIsSizeModalOpen(false);
            if (attributeName === 'colors') setIsColorModalOpen(false);
            
            setSuccessMessage(`${successMsgPrefix} "${newItem.name || newItem.display_name}" created successfully!`);

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error(`${attributeName} Creation Error:`, err);
            setError(message || `Failed to create ${attributeName.slice(0, -1)}.`);
        } finally {
            setIsSubmittingAttribute(false);
        }
    };
    
    const handleAddCategory = (e: FormEvent<HTMLFormElement>) => handleAddAttribute(
        e, '/api/admin/categories', 
        { name: newCategoryForm.name, description: newCategoryForm.description || null, parent_id: newCategoryForm.parent_id || null },
        setNewCategoryForm, setIsSubmittingCategory, fetchCategories, 'categories',
        { name: '', description: null, parent_id: null }, "Category"
    );

    const handleAddCollection = (e: FormEvent<HTMLFormElement>) => handleAddAttribute(
        e, '/api/admin/collections',
        { name: newCollectionForm.name, description: newCollectionForm.description || null },
        setNewCollectionForm, setIsSubmittingCollection, fetchCollections, 'collections',
        { name: '', description: null }, "Collection"
    );

    const handleAddSize = (e: FormEvent<HTMLFormElement>) => handleAddAttribute(
        e, '/api/admin/sizes',
        { name: newSizeForm.name, display_name: newSizeForm.display_name },
        setNewSizeForm, setIsSubmittingSize, fetchProductSizes, 'sizes',
        { name: '', display_name: '' }, "Size"
    );

    const handleAddColor = (e: FormEvent<HTMLFormElement>) => handleAddAttribute(
        e, '/api/admin/colors',
        { name: newColorForm.name, display_name: newColorForm.display_name, hex_code: newColorForm.hex_code },
        setNewColorForm, setIsSubmittingColor, fetchProductColors, 'colors',
        { name: '', display_name: '', hex_code: '#000000' }, "Color"
    );


    if (authLoading) {
        return <div className="text-center py-10">Loading authentication...</div>;
    }
    if (!user || profile?.role !== 'ADMIN') {
        // useEffect will redirect, but this prevents brief render of form
        return <div className="text-center py-10 text-red-600">Access Denied. Admin privileges required. You will be redirected.</div>;
    }
    if (loadingOptions && (!categories.length && !collections.length && !availableSizes.length && !availableColors.length)) {
         return <div className="text-center py-10">Loading form options...</div>;
    }


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded whitespace-pre-line">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Details Fields (Name, Desc, Price, etc.) */}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave blank if the product should be available immediately (if active).</p>
                        </div>
                    </div>

                     {/* Right Column - Attributes */}
                    <div className="space-y-6">
                        {/* Categories */}
                        <div>
                            <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                            <div className="flex items-center mb-2">
                                <select
                                    id="categories"
                                    name="categories"
                                    multiple
                                    value={formData.categories}
                                    onChange={handleCategoryChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    size={4}
                                    disabled={isSubmitting || loadingOptions}
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.parent_id ? '-- ' : ''}{category.name}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    title="Add new category"
                                    className="ml-2 p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
                        </div>

                        {/* Collections */}
                        <div>
                            <label htmlFor="collections" className="block text-sm font-medium text-gray-700 mb-1">Collections</label>
                            <div className="flex items-center mb-2">
                                <select
                                    id="collections"
                                    name="collections"
                                    multiple
                                    value={formData.collections}
                                    onChange={handleCollectionChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    size={4}
                                    disabled={isSubmitting || loadingOptions}
                                >
                                    {collections.map((collection) => (
                                        <option key={collection.id} value={collection.id}>
                                            {collection.name}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    title="Add new collection"
                                    className="ml-2 p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    onClick={() => setIsCollectionModalOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
                        </div>
                        
                        {/* Sizes */}
                        <div>
                            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
                            <div className="flex items-center mb-2">
                                <select
                                    id="sizes"
                                    name="sizes"
                                    multiple
                                    value={formData.sizes}
                                    onChange={handleSizeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    size={4}
                                    disabled={isSubmitting || loadingOptions}
                                >
                                    {availableSizes.map((size) => (
                                        <option key={size.id} value={size.id}>
                                            {size.display_name}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    title="Add new size"
                                    className="ml-2 p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    onClick={() => setIsSizeModalOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                             <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
                        </div>

                        {/* Colors */}
                         <div>
                            <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">Available Colors</label>
                            {/* Color Swatches */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {availableColors.map((color) => (
                                    <div 
                                        key={color.id} 
                                        className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                                            formData.colors.includes(color.id) ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'
                                        } ${isSubmitting || loadingOptions ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                                        title={color.display_name}
                                        onClick={() => {
                                            if (isSubmitting || loadingOptions) return;
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
                                <div 
                                    key="add-color-button-static" // Added unique key
                                    className={`w-6 h-6 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => !isSubmitting && setIsColorModalOpen(true)}
                                    title="Add new color"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                            {/* Color Select (Optional alongside swatches) */}
                            <div className="flex items-center mb-2">
                                <select
                                    id="colors"
                                    name="colors"
                                    multiple
                                    value={formData.colors}
                                    onChange={handleColorChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    size={4}
                                    disabled={isSubmitting || loadingOptions}
                                >
                                    {availableColors.map((color) => (
                                        <option key={color.id} value={color.id}>
                                            {color.display_name}
                                        </option>
                                    ))}
                                </select>
                                 <button 
                                    type="button" 
                                    title="Add new color (alternative)"
                                    className="ml-2 p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    onClick={() => setIsColorModalOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Click swatches or use Ctrl/Cmd to select multiple in dropdown.</p>
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${isSubmitting ? 'bg-gray-100' : ''}`}>
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="image-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none ${isSubmitting ? 'pointer-events-none text-gray-400' : ''}`}>
                                    <span>Upload images</span>
                                    <input 
                                        id="image-upload" 
                                        name="images[]" 
                                        type="file" 
                                        multiple
                                        accept="image/png, image/jpeg, image/gif, image/webp"
                                        onChange={handleFilesChange}
                                        className="sr-only"
                                        disabled={isSubmitting}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                        </div>
                    </div>
                    {previewUrls.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h3>
                            <div className="flex flex-wrap gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={url + index} className="relative"> {/* Use URL + index for a more unique key if files can be same name */}
                                        <NextImage 
                                            src={url} 
                                            alt={`Preview ${index + 1}`} 
                                            width={96} 
                                            height={96} 
                                            className="object-cover rounded border" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => !isSubmitting && removeFile(index)}
                                            disabled={isSubmitting}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center disabled:opacity-50"
                                        >×</button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 text-white text-xs text-center py-1">Primary</div>
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
                                if (isSubmitting) return;
                                const checked = e.target.checked;
                                setHasVariants(checked);
                                if (checked) {
                                    updateVariantsFromSelections(formData.sizes, formData.colors);
                                } else {
                                    setVariants([]); // Clear variants if unchecked
                                }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="hasVariants" className="ml-2 block text-sm font-medium text-gray-700">Manage Inventory by Size/Color Variants</label>
                    </div>

                    {hasVariants && (
                        <div className="mt-4">
                            {formData.sizes.length === 0 || formData.colors.length === 0 ? (
                                <div className="py-4 text-center text-amber-600 text-sm">
                                    Please select at least one size and one color to create variants.
                                </div>
                            ) : variants.length > 0 ? (
                                <>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Variant Inventory & Pricing</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-4 gap-2 mb-2 font-medium text-gray-700 text-sm">
                                        <div>Size</div>
                                        <div>Color</div>
                                        <div>Inventory <span className="text-red-500">*</span></div>
                                        <div>Price (USD) <span className="text-red-500">*</span></div>
                                    </div>
                                    {variants.map((variant, index) => {
                                        const size = availableSizes.find(s => s.id === variant.sizeId);
                                        const color = availableColors.find(c => c.id === variant.colorId);
                                        return (
                                            <div key={`${variant.sizeId}-${variant.colorId}-${index}`} className="grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-200 last:border-b-0">
                                                <div className="text-sm">{size?.display_name || 'N/A'}</div>
                                                <div className="flex items-center text-sm">
                                                    {color?.hex_code && <div className="w-4 h-4 mr-2 rounded-full border" style={{ backgroundColor: color.hex_code }}></div>}
                                                    {color?.display_name || 'N/A'}
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        value={variant.inventory}
                                                        onChange={(e) => handleVariantInventoryChange(variant.sizeId, variant.colorId, parseInt(e.target.value, 10) || 0)}
                                                        min="0" step="1" required
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-1 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => handleVariantPriceChange(variant.sizeId, variant.colorId, e.target.value)}
                                                        min="0" step="0.01" required
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                </>
                            ) : (
                                <div className="py-4 text-center text-gray-500 text-sm">
                                    No variants generated yet. Ensure sizes and colors are selected.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting || authLoading || loadingOptions}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Product...' : 'Create Product'}
                    </button>
                </div>
            </form>

            {/* Modals (Category, Collection, Size, Color) */}
            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Category</h2>
                            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setIsCategoryModalOpen(false)} disabled={isSubmittingCategory}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label htmlFor="newCategoryName" className="block text-sm font-medium">Name <span className="text-red-500">*</span></label>
                                <input type="text" id="newCategoryName" value={newCategoryForm.name} onChange={(e) => setNewCategoryForm({...newCategoryForm, name: e.target.value})} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingCategory} />
                            </div>
                            <div>
                                <label htmlFor="newCategoryDescription" className="block text-sm font-medium">Description</label>
                                <textarea id="newCategoryDescription" value={newCategoryForm.description || ''} onChange={(e) => setNewCategoryForm({...newCategoryForm, description: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingCategory} />
                            </div>
                            <div>
                                <label htmlFor="newParentCategory" className="block text-sm font-medium">Parent Category</label>
                                <select id="newParentCategory" value={newCategoryForm.parent_id || ''} onChange={(e) => setNewCategoryForm({...newCategoryForm, parent_id: e.target.value || null})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingCategory}>
                                    <option value="">No Parent</option>
                                    {categories.filter(c => c.id !== newCategoryForm.parent_id).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border rounded-md text-sm" disabled={isSubmittingCategory}>Cancel</button>
                                <button type="submit" disabled={isSubmittingCategory} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">
                                    {isSubmittingCategory ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Collection Modal */}
            {isCollectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Collection</h2>
                            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setIsCollectionModalOpen(false)} disabled={isSubmittingCollection}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddCollection} className="space-y-4">
                            <div>
                                <label htmlFor="newCollectionName" className="block text-sm font-medium">Name <span className="text-red-500">*</span></label>
                                <input type="text" id="newCollectionName" value={newCollectionForm.name} onChange={(e) => setNewCollectionForm({...newCollectionForm, name: e.target.value})} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingCollection} />
                            </div>
                            <div>
                                <label htmlFor="newCollectionDescription" className="block text-sm font-medium">Description</label>
                                <textarea id="newCollectionDescription" value={newCollectionForm.description || ''} onChange={(e) => setNewCollectionForm({...newCollectionForm, description: e.target.value})} rows={3} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingCollection} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsCollectionModalOpen(false)} className="px-4 py-2 border rounded-md text-sm" disabled={isSubmittingCollection}>Cancel</button>
                                <button type="submit" disabled={isSubmittingCollection} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">
                                    {isSubmittingCollection ? 'Creating...' : 'Create Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Size Modal */}
            {isSizeModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Size</h2>
                             <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setIsSizeModalOpen(false)} disabled={isSubmittingSize}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddSize} className="space-y-4">
                            <div>
                                <label htmlFor="newSizeName" className="block text-sm font-medium">Size Code <span className="text-red-500">*</span></label>
                                <input type="text" id="newSizeName" value={newSizeForm.name} onChange={(e) => setNewSizeForm({...newSizeForm, name: e.target.value})} required placeholder="e.g. S, M, XL, 32" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingSize} />
                                <p className="mt-1 text-xs text-gray-500">Internal code (e.g., &quot;S&quot;, &quot;XL&quot;).</p>
                            </div>
                            <div>
                                <label htmlFor="newSizeDisplayName" className="block text-sm font-medium">Display Name <span className="text-red-500">*</span></label>
                                <input type="text" id="newSizeDisplayName" value={newSizeForm.display_name} onChange={(e) => setNewSizeForm({...newSizeForm, display_name: e.target.value})} required placeholder="e.g. Small, Extra Large, 32 Waist" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingSize} />
                                <p className="mt-1 text-xs text-gray-500">User-friendly name.</p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsSizeModalOpen(false)} className="px-4 py-2 border rounded-md text-sm" disabled={isSubmittingSize}>Cancel</button>
                                <button type="submit" disabled={isSubmittingSize} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">
                                    {isSubmittingSize ? 'Creating...' : 'Create Size'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Color Modal */}
            {isColorModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Color</h2>
                            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setIsColorModalOpen(false)} disabled={isSubmittingColor}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddColor} className="space-y-4">
                            <div>
                                <label htmlFor="newColorName" className="block text-sm font-medium">Color Code <span className="text-red-500">*</span></label>
                                <input type="text" id="newColorName" value={newColorForm.name} onChange={(e) => setNewColorForm({...newColorForm, name: e.target.value})} required placeholder="e.g. red, navy_blue" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingColor} />
                                 <p className="mt-1 text-xs text-gray-500">Internal code (e.g., &quot;navy_blue&quot;).</p>
                            </div>
                            <div>
                                <label htmlFor="newColorDisplayName" className="block text-sm font-medium">Display Name <span className="text-red-500">*</span></label>
                                <input type="text" id="newColorDisplayName" value={newColorForm.display_name} onChange={(e) => setNewColorForm({...newColorForm, display_name: e.target.value})} required placeholder="e.g. Cherry Red, Navy Blue" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingColor} />
                                <p className="mt-1 text-xs text-gray-500">User-friendly name.</p>
                            </div>
                            <div>
                                <label htmlFor="newColorHex" className="block text-sm font-medium">Hex Value</label>
                                <div className="flex items-center space-x-2 mt-1">
                                <input type="color" id="newColorHexValue" value={newColorForm.hex_code} onChange={(e) => setNewColorForm({...newColorForm, hex_code: e.target.value})} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" disabled={isSubmittingColor} />
                                <input type="text" id="newColorHexText" value={newColorForm.hex_code} onChange={(e) => setNewColorForm({...newColorForm, hex_code: e.target.value})} placeholder="#RRGGBB" className="flex-1 px-3 py-2 border border-gray-300 rounded-md" disabled={isSubmittingColor} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Color for swatch display.</p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsColorModalOpen(false)} className="px-4 py-2 border rounded-md text-sm" disabled={isSubmittingColor}>Cancel</button>
                                <button type="submit" disabled={isSubmittingColor} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">
                                    {isSubmittingColor ? 'Creating...' : 'Create Color'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewProductPage;