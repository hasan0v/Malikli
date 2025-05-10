'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

// Define your types
export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image_urls: string[] | null;
  };
};

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
  const router = useRouter();

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
  const getLocalCartItems = () => {
    if (typeof window !== 'undefined') {
      const localCart = localStorage.getItem('malikli-cart');
      return localCart ? JSON.parse(localCart) : [];
    }
    return [];
  };

  // Function to save cart items to local storage (for non-authenticated users)
  const saveLocalCartItems = (items: CartItem[]) => {
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
          const { data, error } = await supabase
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

          if (error) {
            throw error;
          }

          // Transform the nested data structure
          const formattedItems = data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: {
              name: item.products?.name,
              price: item.products?.price,
              image_urls: item.products?.image_urls
            }
          }));

          setCartItems(formattedItems);
        } else {
          // For non-authenticated users, use local storage
          const localItems = getLocalCartItems();
          
          if (localItems.length > 0) {
            // Fetch product details for local cart items
            const productIds = localItems.map((item: any) => item.product_id);
            
            const { data: products, error } = await supabase
              .from('products')
              .select('id, name, price, image_urls')
              .in('id', productIds);

            if (error) {
              throw error;
            }

            // Map product details to cart items
            const itemsWithDetails = localItems.map((item: any) => {
              const product = products.find((p: any) => p.id === item.product_id);
              return {
                ...item,
                product: product ? {
                  name: product.name,
                  price: product.price,
                  image_urls: product.image_urls
                } : undefined
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
    try {
      // First, get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, image_urls, inventory_count')
        .eq('id', productId)
        .single();

      if (productError) {
        throw productError;
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if there's enough inventory
      if (product.inventory_count < quantity) {
        throw new Error(`Only ${product.inventory_count} items available`);
      }

      if (user) {
        // For authenticated users
        // Check if item already exists in cart
        const existingItem = cartItems.find(item => item.product_id === productId);

        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + quantity;
          
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('user_id', user.id)
            .eq('product_id', productId);

          if (error) {
            throw error;
          }
        } else {
          // Add new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity
            });

          if (error) {
            throw error;
          }
        }

        // Refetch cart after update
        const { data, error } = await supabase
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

        if (error) {
          throw error;
        }

        // Transform the nested data structure
        const formattedItems = data.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: {
            name: item.products?.name,
            price: item.products?.price,
            image_urls: item.products?.image_urls
          }
        }));

        setCartItems(formattedItems);
      } else {
        // For non-authenticated users
        const localItems = getLocalCartItems();
        const existingItemIndex = localItems.findIndex((item: any) => item.product_id === productId);

        if (existingItemIndex !== -1) {
          // Update existing item
          localItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          localItems.push({
            id: `local-${Date.now()}`,
            product_id: productId,
            quantity,
            product: {
              name: product.name,
              price: product.price,
              image_urls: product.image_urls
            }
          });
        }

        saveLocalCartItems(localItems);
        setCartItems(localItems);
      }

      // Open the cart after adding an item
      openCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
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
        const updatedItems = localItems.filter((item: any) => item.product_id !== productId);
        
        saveLocalCartItems(updatedItems);
        setCartItems(updatedItems);
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
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('inventory_count')
        .eq('id', productId)
        .single();

      if (productError) {
        throw productError;
      }

      if (product.inventory_count < quantity) {
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
        const updatedItems = localItems.map((item: any) =>
          item.product_id === productId ? { ...item, quantity } : item
        );
        
        saveLocalCartItems(updatedItems);
        setCartItems(updatedItems);
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
              const { data: existingItems } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', user.id)
                .eq('product_id', item.product_id);
                
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
            const { data, error } = await supabase
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

            if (error) {
              throw error;
            }

            // Transform the data
            const formattedItems = data.map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity,
              product: {
                name: item.products?.name,
                price: item.products?.price,
                image_urls: item.products?.image_urls
              }
            }));

            setCartItems(formattedItems);
          } catch (error) {
            console.error('Error merging carts:', error);
          }
        }
      }
    };

    mergeCartsOnLogin();
  }, [user?.id]);

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