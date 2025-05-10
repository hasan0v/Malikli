'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from './AuthContext';
// import { useRouter } from 'next/navigation'; // Removed as router is not used

// Define your types
export type ProductDetails = {
  name: string;
  price: number;
  image_urls: string[] | null;
  // Add other product fields if needed from the 'products' table
  id?: string; // Optional, but good for mapping
  inventory_count?: number; // For inventory checks
};

export type CartItem = {
  id: string; // This can be cart_item_id or a local generated ID
  product_id: string;
  quantity: number;
  product?: ProductDetails; // This will hold the joined product data
};

// Type for items as fetched from Supabase cart_items with nested products (as an array)
interface FetchedDbCartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: ProductDetails[] | null; // Supabase join might return an array
}

// Type for local cart items that might not have full product details initially
interface LocalCartItem {
  id: string; // local generated ID
  product_id: string;
  quantity: number;
  product?: ProductDetails; // May be populated later
}


export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Create useCart hook
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { user } = useAuth();
  // const router = useRouter(); // ESLint: 'router' is assigned a value but never used.

  // Open and close cart
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Calculate cart count and total
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  // Function to fetch cart items from local storage (for non-authenticated users)
  const getLocalCartItems = (): LocalCartItem[] => {
    if (typeof window !== 'undefined') {
      const localCart = localStorage.getItem('malikli-cart');
      return localCart ? JSON.parse(localCart) as LocalCartItem[] : [];
    }
    return [];
  };

  // Function to save cart items to local storage (for non-authenticated users)
  const saveLocalCartItems = (items: LocalCartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('malikli-cart', JSON.stringify(items));
    }
  };

  // Fetch cart items when user changes (login/logout)
  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          // For authenticated users, fetch from Supabase
          // 1. Fetch cart items
          const { data: dbCartData, error: cartError } = await supabase
            .from('cart_items')
            .select('id, product_id, quantity')
            .eq('user_id', user.id);

          if (cartError) {
            console.error('Error fetching cart items from DB:', cartError);
            throw cartError;
          }
          console.log('Fetched raw cart items for user:', dbCartData); // DEBUG LOG

          if (!dbCartData || dbCartData.length === 0) {
            setCartItems([]);
            setIsLoading(false);
            return;
          }

          // 2. Extract product IDs and fetch product details
          const productIds = dbCartData.map((item) => item.product_id);
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, image_urls, inventory_count') // Ensure all needed fields are here
            .in('id', productIds);

          if (productsError) {
            console.error('Error fetching product details for cart:', productsError);
            throw productsError;
          }
          console.log('Fetched product details for cart:', productsData); // DEBUG LOG

          // 3. Combine cart items with product details
          const formattedItems: CartItem[] = dbCartData.map((cartItem) => {
            const productDetail = productsData?.find((p) => p.id === cartItem.product_id);
            return {
              id: cartItem.id,
              product_id: cartItem.product_id,
              quantity: cartItem.quantity,
              product: productDetail || undefined // Ensure it's ProductDetails or undefined
            };
          });

          setCartItems(formattedItems);
        } else {
          // For non-authenticated users, use local storage
          const localItems = getLocalCartItems();
          
          if (localItems.length > 0) {
            // Fetch product details for local cart items
            const productIds = localItems.map((item) => item.product_id);
            
            const { data: productsData, error } = await supabase
              .from('products')
              .select('id, name, price, image_urls')
              .in('id', productIds);

            if (error) {
              throw error;
            }
            const products = productsData as ProductDetails[];


            // Map product details to cart items
            const itemsWithDetails: CartItem[] = localItems.map((item) => {
              const productDetail = products.find((p) => p.id === item.product_id);
              return {
                ...item,
                product: productDetail // productDetail is ProductDetails or undefined
              };
            });

            setCartItems(itemsWithDetails);
          } else {
            setCartItems([]);
          }
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [user]); 

  // Add item to cart
  const addToCart = async (productId: string, quantity: number) => {
    setIsLoading(true); // Start loading
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, price, image_urls, inventory_count')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!productData) throw new Error('Product not found');

      const productDetailsForOperation = productData as ProductDetails; // Renamed to avoid conflict
      if (productDetailsForOperation.inventory_count !== undefined && productDetailsForOperation.inventory_count < quantity) {
        throw new Error(`Only ${productDetailsForOperation.inventory_count} items available`);
      }

      if (user) {
        const existingItem = cartItems.find(item => item.product_id === productId);
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('user_id', user.id)
            .eq('product_id', productId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: productId, quantity });
          if (error) throw error;
        }

        // Refetch cart using the two-step process
        const { data: updatedDbCartData, error: updatedCartError } = await supabase
          .from('cart_items')
          .select('id, product_id, quantity')
          .eq('user_id', user.id);
        
        console.log('Raw updatedCartDbData from addToCart:', updatedDbCartData); // DEBUG LOG

        if (updatedCartError) throw updatedCartError;

        if (!updatedDbCartData || updatedDbCartData.length === 0) {
          setCartItems([]);
        } else {
          const updatedProductIds = updatedDbCartData.map((item) => item.product_id);
          const { data: updatedProductsData, error: updatedProductsError } = await supabase
            .from('products')
            .select('id, name, price, image_urls, inventory_count')
            .in('id', updatedProductIds);

          console.log('Fetched updatedProductDetails for cart (addToCart):', updatedProductsData); // DEBUG LOG

          if (updatedProductsError) throw updatedProductsError;

          const formattedItems: CartItem[] = updatedDbCartData.map((cartItem) => {
            const productDetail = updatedProductsData?.find((p) => p.id === cartItem.product_id);
            return {
              id: cartItem.id,
              product_id: cartItem.product_id,
              quantity: cartItem.quantity,
              product: productDetail || undefined
            };
          });
          setCartItems(formattedItems);
        }
      } else {
        // For non-authenticated users
        const localItems = getLocalCartItems();
        const existingItemIndex = localItems.findIndex((item) => item.product_id === productId);

        if (existingItemIndex !== -1) {
          localItems[existingItemIndex].quantity += quantity;
          // Ensure product details are present if somehow missing
          if (!localItems[existingItemIndex].product) {
             localItems[existingItemIndex].product = productDetailsForOperation;
          }
        } else {
          // Add new item with product details
          localItems.push({
            id: `local-${Date.now()}`, 
            product_id: productId,
            quantity,
            product: productDetailsForOperation 
          });
        }
        saveLocalCartItems(localItems);
        setCartItems([...localItems] as CartItem[]); // Update state with a new array reference
      }

      openCart(); // Open the cart after adding an item
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Potentially re-throw or set an error state for the UI to consume
      // throw error; 
    } finally {
      setIsLoading(false); // Ensure loading is set to false in all cases
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      if (user) {
        // For authenticated users
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          throw error;
        }

        // Update cart items state
        setCartItems(cartItems.filter(item => item.product_id !== productId));
      } else {
        // For non-authenticated users
        const localItems = getLocalCartItems();
        const updatedItems = localItems.filter((item) => item.product_id !== productId);
        
        saveLocalCartItems(updatedItems);
        setCartItems(updatedItems as CartItem[]);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      // If quantity is 0 or negative, remove the item
      if (quantity <= 0) {
        return removeFromCart(productId);
      }

      // Check available inventory
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('inventory_count')
        .eq('id', productId)
        .single();

      if (productError) {
        throw productError;
      }
      const product = productData as Pick<ProductDetails, 'inventory_count'>;


      if (product.inventory_count !== undefined && product.inventory_count < quantity) {
        throw new Error(`Only ${product.inventory_count} items available`);
      }

      if (user) {
        // For authenticated users
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          throw error;
        }

        // Update local state
        setCartItems(
          cartItems.map(item => 
            item.product_id === productId ? { ...item, quantity } : item
          )
        );
      } else {
        // For non-authenticated users
        const localItems = getLocalCartItems();
        const updatedItems = localItems.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        );
        
        saveLocalCartItems(updatedItems);
        setCartItems(updatedItems as CartItem[]);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      if (user) {
        // For authenticated users
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
      } else {
        // For non-authenticated users
        saveLocalCartItems([]);
      }
      
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Merge local cart with user cart when logging in
  useEffect(() => {
    const mergeCartsOnLogin = async () => {
      if (user) {
        const localItems = getLocalCartItems();
        
        // If there are items in local storage
        if (localItems.length > 0) {
          try {
            // For each local item, add to user's cart
            for (const item of localItems) {
              // Check if item already exists in database
              const { data: existingItemsData } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', user.id)
                .eq('product_id', item.product_id);
              
              const existingItems = existingItemsData as {id: string, quantity: number}[] | null;

                
              if (existingItems && existingItems.length > 0) {
                // Update quantity if item exists
                await supabase
                  .from('cart_items')
                  .update({ 
                    quantity: existingItems[0].quantity + item.quantity 
                  })
                  .eq('id', existingItems[0].id);
              } else {
                // Insert new item if it doesn't exist
                await supabase
                  .from('cart_items')
                  .insert({
                    user_id: user.id,
                    product_id: item.product_id,
                    quantity: item.quantity
                  });
              }
            }
            
            // Clear local storage after merging
            saveLocalCartItems([]);
            
            // Fetch the updated cart
            const { data: updatedCartDbData, error: fetchError } = await supabase
              .from('cart_items')
              .select(`
                id, 
                product_id, 
                quantity,
                products:product_id (
                  name, 
                  price, 
                  image_urls
                )
              `)
              .eq('user_id', user.id);

            if (fetchError) {
              throw fetchError;
            }
            const updatedFetchedCart = updatedCartDbData as FetchedDbCartItem[];


            // Transform the data
            const formattedItems: CartItem[] = updatedFetchedCart.map((item) => {
                const mainProduct = item.products && item.products.length > 0 ? item.products[0] : null;
                return {
                  id: item.id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  product: mainProduct || undefined
                };
            });

            setCartItems(formattedItems);
          } catch (error) {
            console.error('Error merging carts:', error);
          }
        }
      }
    };

    mergeCartsOnLogin();
  }, [user]); // Changed from user?.id to user for exhaustive-deps

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};