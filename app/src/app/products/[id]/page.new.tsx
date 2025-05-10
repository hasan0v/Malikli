'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  drop_scheduled_time: string | null;
  created_at: string;
  updated_at: string;
  // Normalized relationships
  categories: {
    id: string;
    name: string;
  }[];
  collections: {
    id: string;
    name: string;
  }[];
  images: {
    id: string;
    url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
  sizes: {
    id: string;
    name: string;
    display_name: string;
  }[];
  colors: {
    id: string;
    name: string;
    display_name: string;
    hex_code: string | null;
  }[];
  variants: {
    id: string;
    size_id: string;
    color_id: string;
    inventory_count: number;
    price_adjustment: number;
  }[];
}

// Product variant with size and color objects
interface ProductVariant {
  id: string;
  inventory_count: number;
  price: number; // Base price + adjustment
  size: {
    id: string;
    name: string;
    display_name: string;
  };
  color: {
    id: string;
    name: string;
    display_name: string;
    hex_code: string | null;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, openCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Variant selection
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Error states
  const [showSizeError, setShowSizeError] = useState(false);
  const [showColorError, setShowColorError] = useState(false);
  
  // Image zoom
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const productId = params.id as string;

  // Load product data with all related information
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch product with all its relationships
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            description, 
            price, 
            inventory_count, 
            is_active,
            drop_scheduled_time,
            created_at,
            updated_at,
            product_categories (
              category:categories(id, name)
            ),
            product_collections (
              collection:collections(id, name)
            ),
            product_images (
              id, url, is_primary, sort_order
            ),
            product_size_variants (
              size:product_sizes(id, name, display_name)
            ),
            product_color_variants (
              color:product_colors(id, name, display_name, hex_code)
            ),
            product_variants (
              id, size_id, color_id, inventory_count, price_adjustment
            )
          `)
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Product not found');
        }

        // Transform data to match our Product interface
        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          inventory_count: data.inventory_count,
          is_active: data.is_active,
          drop_scheduled_time: data.drop_scheduled_time,
          created_at: data.created_at,
          updated_at: data.updated_at,
          categories: data.product_categories.map((pc: any) => pc.category),
          collections: data.product_collections.map((pc: any) => pc.collection),
          images: data.product_images,
          sizes: data.product_size_variants.map((psv: any) => psv.size),
          colors: data.product_color_variants.map((pcv: any) => pcv.color),
          variants: data.product_variants
        };

        setProduct(transformedProduct);
        
        // Set the first image as the selected one (primary if exists)
        if (transformedProduct.images && transformedProduct.images.length > 0) {
          const primaryImage = transformedProduct.images.find(img => img.is_primary);
          setSelectedImage(primaryImage ? primaryImage.url : transformedProduct.images[0].url);
        }
        
        // Set default selected size and color if available
        if (transformedProduct.sizes && transformedProduct.sizes.length > 0) {
          setSelectedSizeId(transformedProduct.sizes[0].id);
        }
        
        if (transformedProduct.colors && transformedProduct.colors.length > 0) {
          setSelectedColorId(transformedProduct.colors[0].id);
        }
        
        // If there's only one size and one color, select the variant automatically
        if (transformedProduct.sizes.length === 1 && transformedProduct.colors.length === 1) {
          findAndSetSelectedVariant(
            transformedProduct,
            transformedProduct.sizes[0].id,
            transformedProduct.colors[0].id
          );
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  // Update selected variant when size or color changes
  useEffect(() => {
    if (product && selectedSizeId && selectedColorId) {
      findAndSetSelectedVariant(product, selectedSizeId, selectedColorId);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSizeId, selectedColorId, product]);
  
  // Find and set the selected variant based on size and color
  const findAndSetSelectedVariant = (product: Product, sizeId: string, colorId: string) => {
    const variant = product.variants.find(v => v.size_id === sizeId && v.color_id === colorId);
    
    if (variant) {
      const size = product.sizes.find(s => s.id === sizeId);
      const color = product.colors.find(c => c.id === colorId);
      
      if (size && color) {
        setSelectedVariant({
          id: variant.id,
          inventory_count: variant.inventory_count,
          price: product.price + variant.price_adjustment,
          size,
          color
        });
      }
    } else {
      setSelectedVariant(null);
    }
  };

  // Quantity control handlers
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };
  
  const incrementQuantity = () => {
    const maxInventory = selectedVariant ? selectedVariant.inventory_count : (product?.inventory_count || 0);
    if (quantity < maxInventory) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Size and color selection handlers
  const handleSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    setShowSizeError(false);
  };
  
  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);
    setShowColorError(false);
  };
  
  // Add to cart handler
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Validate size and color selection if we have variants
    if (product.variants.length > 0) {
      if (!selectedSizeId) {
        setShowSizeError(true);
        return;
      }
      
      if (!selectedColorId) {
        setShowColorError(true);
        return;
      }
      
      if (!selectedVariant) {
        alert("Selected combination is not available");
        return;
      }
      
      if (selectedVariant.inventory_count < quantity) {
        alert("Not enough inventory available");
        return;
      }
    } else {
      // Check regular inventory if no variants
      if (product.inventory_count < quantity) {
        alert("Not enough inventory available");
        return;
      }
    }
    
    setAddingToCart(true);
    
    try {
      // Add product to cart with variant information if present
      await addToCart({
        product_id: product.id,
        name: product.name,
        price: selectedVariant ? selectedVariant.price : product.price,
        quantity,
        image_url: selectedImage || '',
        variant_id: selectedVariant?.id,
        size_id: selectedSizeId,
        size_name: selectedVariant?.size.display_name,
        color_id: selectedColorId,
        color_name: selectedVariant?.color.display_name,
        color_hex: selectedVariant?.color.hex_code || undefined,
      });
      
      // Open cart after adding
      openCart();
    } catch (err) {
      console.error("Failed to add product to cart:", err);
      alert("Failed to add product to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Image zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoom) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setZoomPosition({ x, y });
  };
  
  // Get inventory count based on variant selection
  const getAvailableInventory = (): number => {
    if (selectedVariant) {
      return selectedVariant.inventory_count;
    }
    return product?.inventory_count || 0;
  };
  
  // Get current price based on variant selection
  const getCurrentPrice = (): number => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };
  
  // Check if a specific variant is available
  const isVariantAvailable = (sizeId: string, colorId: string): boolean => {
    if (!product) return false;
    
    const variant = product.variants.find(
      v => v.size_id === sizeId && v.color_id === colorId
    );
    
    return variant ? variant.inventory_count > 0 : false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error: {error || 'Product not found'}</p>
        <Link href="/products" className="text-[#76bfd4] hover:underline">
          Return to Products
        </Link>
      </div>
    );
  }

  const inventory = getAvailableInventory();
  const isLowStock = inventory > 0 && inventory <= 10;
  const isSoldOut = inventory === 0;
  const currentPrice = getCurrentPrice();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap -mx-4">
        {/* Product Images */}
        <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4"
               onMouseEnter={() => setShowZoom(true)}
               onMouseLeave={() => setShowZoom(false)}
               onMouseMove={handleMouseMove}
          >
            {selectedImage ? (
              <>
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
                {showZoom && (
                  <div className="absolute top-0 left-full ml-4 w-64 h-64 rounded-lg overflow-hidden border-2 border-[#76bfd4] hidden md:block">
                    <div 
                      className="absolute w-[500%] h-[500%]" 
                      style={{ 
                        backgroundImage: `url(${selectedImage})`, 
                        backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                        backgroundSize: 'cover',
                        transform: 'translate(-' + (zoomPosition.x * 80) + '%, -' + (zoomPosition.y * 80) + '%)'
                      }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.images.sort((a, b) => a.sort_order - b.sort_order).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image.url)}
                  className={`w-16 h-16 border rounded-md overflow-hidden ${
                    selectedImage === image.url ? 'border-[#76bfd4] ring-2 ring-[#b597ff]' : 'border-gray-200'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="w-full md:w-1/2 px-4">
          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="mb-2 text-sm">
              <span className="text-gray-500">
                {product.categories.map(c => c.name).join(' / ')}
              </span>
            </div>
          )}
          
          {/* Product Name */}
          <h1 className="text-3xl font-bold text-[#24225c] mb-2">{product.name}</h1>
          
          {/* Price */}
          <p className="text-2xl text-[#24225c] mb-4">${currentPrice.toFixed(2)}</p>
          
          {/* Collections */}
          {product.collections && product.collections.length > 0 && (
            <div className="mb-4">
              <span className="inline-block bg-[#f0f0f0] text-[#24225c] px-2 py-1 text-xs rounded-full">
                {product.collections[0].name} Collection
              </span>
            </div>
          )}
          
          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#24225c] mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h2 className="text-sm font-semibold text-[#24225c]">Size</h2>
                {showSizeError && (
                  <p className="text-red-500 text-xs">Please select a size</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  // Check if any variant with this size has inventory
                  const hasInventory = product.variants.length === 0 || 
                    product.colors.some(color => isVariantAvailable(size.id, color.id));
                  
                  return (
                    <button
                      key={size.id}
                      onClick={() => hasInventory && handleSizeChange(size.id)}
                      className={`px-3 py-1 rounded border text-sm ${
                        selectedSizeId === size.id
                          ? 'bg-[#24225c] text-white border-[#24225c]'
                          : hasInventory
                          ? 'bg-white text-gray-800 border-gray-300 hover:border-[#76bfd4]'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                      disabled={!hasInventory}
                    >
                      {size.display_name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h2 className="text-sm font-semibold text-[#24225c]">Color</h2>
                {showColorError && (
                  <p className="text-red-500 text-xs">Please select a color</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  // Check if any variant with this color has inventory
                  const hasInventory = product.variants.length === 0 || 
                    product.sizes.some(size => isVariantAvailable(size.id, color.id));
                    
                  return (
                    <button
                      key={color.id}
                      onClick={() => hasInventory && handleColorChange(color.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        !hasInventory ? 'opacity-30 cursor-not-allowed' : ''
                      } ${
                        selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-[#24225c]' : ''
                      }`}
                      disabled={!hasInventory}
                      title={color.display_name}
                    >
                      <span 
                        className="w-6 h-6 rounded-full inline-block border border-gray-300" 
                        style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                      ></span>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedColorId && product.colors.find(c => c.id === selectedColorId)?.display_name}
              </p>
            </div>
          )}
          
          {/* Quantity */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#24225c] mb-2">Quantity</h2>
            <div className="flex items-center">
              <button 
                onClick={decrementQuantity} 
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                disabled={quantity <= 1}
              >
                -
              </button>
              <select
                value={quantity}
                onChange={handleQuantityChange}
                className="h-8 px-2 border-t border-b border-gray-300 text-center"
                style={{ width: '50px' }}
              >
                {Array.from({ length: inventory }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <button
                onClick={incrementQuantity}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                disabled={quantity >= inventory}
              >
                +
              </button>
              
              {/* Inventory Status */}
              {isSoldOut ? (
                <span className="ml-3 text-red-500 text-sm font-medium">Sold Out</span>
              ) : isLowStock ? (
                <span className="ml-3 text-amber-500 text-sm font-medium">
                  {inventory <= 5 ? `Only ${inventory} left` : 'Low Stock'}
                </span>
              ) : (
                <span className="ml-3 text-green-600 text-sm font-medium">In Stock</span>
              )}
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isSoldOut}
            className="w-full py-3 px-6 bg-[#24225c] hover:bg-[#1a1943] text-white rounded-md font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Adding...
              </>
            ) : isSoldOut ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </button>
          
          {/* Product Metadata */}
          <div className="mt-8 text-sm text-gray-500 space-y-1.5">
            <p>SKU: {product.id.slice(-8).toUpperCase()}</p>
            {product.categories && product.categories.length > 0 && (
              <p>Category: {product.categories.map(c => c.name).join(', ')}</p>
            )}
            {product.collections && product.collections.length > 0 && (
              <p>Collection: {product.collections.map(c => c.name).join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
