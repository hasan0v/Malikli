'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useCart } from '@/context/CartContext';

// Интерфейсы для структуры данных, получаемых из Supabase
interface FetchedCategory {
  id: string;
  name: string;
}

interface FetchedCollection {
  id: string;
  name: string;
}

interface FetchedImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

interface FetchedSize {
  id: string;
  name: string;
  display_name: string;
}

interface FetchedColor {
  id: string;
  name: string;
  display_name: string;
  hex_code: string | null;
}

interface FetchedVariant {
  id: string;
  size_id: string;
  color_id: string;
  inventory_count: number;
  price_adjustment: number;
}

interface FetchedProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  drop_scheduled_time: string | null;
  created_at: string;
  updated_at: string;
  product_categories: { category: FetchedCategory[] | null }[];
  product_collections: { collection: FetchedCollection[] | null }[];
  product_images: FetchedImage[];
  product_size_variants: { size: FetchedSize[] | null }[];
  product_color_variants: { color: FetchedColor[] | null }[];
  product_variants: FetchedVariant[];
}

// Интерфейс для конечного преобразованного состояния Product
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
  categories: FetchedCategory[];
  collections: FetchedCollection[];
  images: FetchedImage[];
  sizes: FetchedSize[];
  colors: FetchedColor[];
  variants: FetchedVariant[];
}

interface ProductVariantDisplay {
  id: string;
  inventory_count: number;
  price: number;
  size: FetchedSize;
  color: FetchedColor;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter(); // Add router for navigation
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDisplay | null>(null);

  const [showSizeError, setShowSizeError] = useState(false);
  const [showColorError, setShowColorError] = useState(false);

  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        // Skip fetching if we're in creation mode (no productId)
        if (!productId) {
          setLoading(false);
          return;
        }

        const { data: rawSupabaseProduct, error: fetchError } = await supabase
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

        if (fetchError) {
          if (fetchError.code === 'PGRST116') throw new Error('Товар не найден'); // Конкретная ошибка для "не найдено"
          throw fetchError;
        }
        if (!rawSupabaseProduct) throw new Error('Товар не найден');

        const typedRawProduct = rawSupabaseProduct as FetchedProductData; // Приведение к нашей предполагаемой структуре

        const transformedProduct: Product = {
          id: typedRawProduct.id,
          name: typedRawProduct.name,
          description: typedRawProduct.description,
          price: typedRawProduct.price,
          inventory_count: typedRawProduct.inventory_count,
          is_active: typedRawProduct.is_active,
          drop_scheduled_time: typedRawProduct.drop_scheduled_time,
          created_at: typedRawProduct.created_at,
          updated_at: typedRawProduct.updated_at,
          categories: (typedRawProduct.product_categories || [])
            .map(pc => pc.category && pc.category.length > 0 ? pc.category[0] : null)
            .filter(Boolean) as FetchedCategory[],
          collections: (typedRawProduct.product_collections || [])
            .map(pc => pc.collection && pc.collection.length > 0 ? pc.collection[0] : null)
            .filter(Boolean) as FetchedCollection[],
          images: typedRawProduct.product_images || [],
          sizes: (typedRawProduct.product_size_variants || [])
            .map(psv => psv.size && psv.size.length > 0 ? psv.size[0] : null)
            .filter(Boolean) as FetchedSize[],
          colors: (typedRawProduct.product_color_variants || [])
            .map(pcv => pcv.color && pcv.color.length > 0 ? pcv.color[0] : null)
            .filter(Boolean) as FetchedColor[],
          variants: typedRawProduct.product_variants || []
        };

        setProduct(transformedProduct);

        if (transformedProduct.images && transformedProduct.images.length > 0) {
          const primaryImage = transformedProduct.images.find(img => img.is_primary);
          setSelectedImage(primaryImage ? primaryImage.url : transformedProduct.images[0].url);
        }

        if (transformedProduct.sizes && transformedProduct.sizes.length > 0 && transformedProduct.sizes[0]) {
          setSelectedSizeId(transformedProduct.sizes[0].id);
        }

        if (transformedProduct.colors && transformedProduct.colors.length > 0 && transformedProduct.colors[0]) {
          setSelectedColorId(transformedProduct.colors[0].id);
        }

        if (transformedProduct.sizes.length === 1 && transformedProduct.colors.length === 1 && transformedProduct.sizes[0] && transformedProduct.colors[0]) {
          findAndSetSelectedVariant(
            transformedProduct,
            transformedProduct.sizes[0].id,
            transformedProduct.colors[0].id
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
        console.error('Ошибка при загрузке товара:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product && selectedSizeId && selectedColorId) {
      findAndSetSelectedVariant(product, selectedSizeId, selectedColorId);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSizeId, selectedColorId, product]);

  const findAndSetSelectedVariant = (currentProduct: Product, sizeId: string, colorId: string) => {
    const variant = currentProduct.variants.find(v => v.size_id === sizeId && v.color_id === colorId);

    if (variant) {
      const size = currentProduct.sizes.find(s => s.id === sizeId);
      const color = currentProduct.colors.find(c => c.id === colorId);

      if (size && color) {
        setSelectedVariant({
          id: variant.id,
          inventory_count: variant.inventory_count,
          price: currentProduct.price + variant.price_adjustment,
          size,
          color
        });
      } else {
        setSelectedVariant(null);
      }
    } else {
      setSelectedVariant(null);
    }
  };

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

  const handleSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    setShowSizeError(false);
  };

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);
    setShowColorError(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;

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
        alert("Выбранная комбинация недоступна");
        return;
      }
      if (selectedVariant.inventory_count < quantity) {
        alert("Недостаточно товара на складе");
        return;
      }
    } else {
      if (product.inventory_count < quantity) {
        alert("Недостаточно товара на складе");
        return;
      }
    }

    setAddingToCart(true);

    try {
      await addToCart(product.id, quantity);
      openCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось добавить товар в корзину.";
      console.error("Не удалось добавить товар в корзину:", err);
      alert(`${message} Пожалуйста, попробуйте еще раз.`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoom || !selectedImage) return; // Added check for selectedImage
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    setZoomPosition({ x, y });
  };

  const getAvailableInventory = (): number => {
    if (!product) return 0; // Added safety check
    if (selectedVariant) return selectedVariant.inventory_count;
    return product?.inventory_count || 0;
  };

  const getCurrentPrice = (): number => {
    if (!product) return 0; // Added safety check
    if (selectedVariant) return selectedVariant.price;
    return product?.price || 0;
  };

  const isVariantAvailable = (sizeId: string, colorId: string): boolean => {
    if (!product) return false;
    const variant = product.variants.find(v => v.size_id === sizeId && v.color_id === colorId);
    return variant ? variant.inventory_count > 0 : false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  // Special handling for new product creation
  if (params.id === "new") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-[#24225c] mb-4">Создание нового товара</h1>
          <p className="text-gray-600 mb-4">
            Используйте форму ниже для создания нового товара
          </p>
          {/* Form would be placed here. For now, showing a placeholder */}
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">Форма создания товара находится в разработке</p>
          </div>
          <div className="mt-4">
            <Link href="/products" className="text-[#76bfd4] hover:underline">
              Вернуться к каталогу товаров
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Ошибка: {error || 'Товар не найден'}</p>
        <Link href="/products" className="text-[#76bfd4] hover:underline">
          Вернуться к товарам
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
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {showZoom && (
                  <div className="absolute top-0 left-full ml-4 w-64 h-64 rounded-lg overflow-hidden border-2 border-[#76bfd4] hidden md:block">
                    <div
                      className="absolute w-[500%] h-[500%]"
                      style={{
                        backgroundImage: `url(${selectedImage})`,
                        backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                        backgroundSize: 'cover',
                        transform: `translate(-${zoomPosition.x * 80}%, -${zoomPosition.y * 80}%)`
                      }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>Нет изображения</span>
              </div>
            )}
          </div>

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
                      alt={`${product.name} - миниатюра`}
                      fill
                      className="object-cover"
                       sizes="64px"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 px-4">
          {product.categories && product.categories.length > 0 && (
            <div className="mb-2 text-sm">
              <span className="text-gray-500">
                {product.categories.map(c => c.name).join(' / ')}
              </span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-[#24225c] mb-2">{product.name}</h1>
          <p className="text-2xl text-[#24225c] mb-4">BYN {currentPrice.toFixed(2)}</p>

          {product.collections && product.collections.length > 0 && (
            <div className="mb-4">
              <span className="inline-block bg-[#f0f0f0] text-[#24225c] px-2 py-1 text-xs rounded-full">
                {product.collections[0].name} Коллекция
              </span>
            </div>
          )}

          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#24225c] mb-2">Описание</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="border-t border-gray-200 my-6"></div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h2 className="text-sm font-semibold text-[#24225c]">Размер</h2>
                {showSizeError && (
                  <p className="text-red-500 text-xs">Пожалуйста, выберите размер</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const hasInventory = product.variants.length === 0 ||
                    (product.colors.length > 0 && product.colors.some(color => isVariantAvailable(size.id, color.id))) ||
                    (product.colors.length === 0 && product.variants.some(v => v.size_id === size.id && v.inventory_count > 0));

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

          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h2 className="text-sm font-semibold text-[#24225c]">Цвет</h2>
                {showColorError && (
                  <p className="text-red-500 text-xs">Пожалуйста, выберите цвет</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  const hasInventory = product.variants.length === 0 ||
                    (product.sizes.length > 0 && product.sizes.some(size => isVariantAvailable(size.id, color.id))) ||
                    (product.sizes.length === 0 && product.variants.some(v => v.color_id === color.id && v.inventory_count > 0));

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

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#24225c] mb-2">Количество</h2>
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
                disabled={inventory === 0}
              >
                {inventory > 0 ? Array.from({ length: inventory }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                )) : <option value="0">0</option>}
              </select>
              <button
                onClick={incrementQuantity}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                disabled={quantity >= inventory || inventory === 0}
              >
                +
              </button>

              {isSoldOut ? (
                <span className="ml-3 text-red-500 text-sm font-medium">Распродано</span>
              ) : isLowStock ? (
                <span className="ml-3 text-amber-500 text-sm font-medium">
                  {inventory <= 5 ? `Осталось ${inventory} шт.` : 'Мало на складе'}
                </span>
              ) : (
                <span className="ml-3 text-green-600 text-sm font-medium">В наличии</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isSoldOut}
            className="w-full py-3 px-6 bg-[#24225c] hover:bg-[#1a1943] text-white rounded-md font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Добавление...
              </>
            ) : isSoldOut ? (
              'Нет в наличии'
            ) : (
              'Добавить в корзину'
            )}
          </button>

          <div className="mt-8 text-sm text-gray-500 space-y-1.5">
            <p>Артикул: {product.id.slice(-8).toUpperCase()}</p>
            {product.categories && product.categories.length > 0 && (
              <p>Категория: {product.categories.map(c => c.name).join(', ')}</p>
            )}
            {product.collections && product.collections.length > 0 && (
              <p>Коллекция: {product.collections.map(c => c.name).join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}