'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface CheckoutFormData {
  // Shipping Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'overnight';
  
  // Payment Info
  paymentMethod: 'credit' | 'paypal';
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  billingAddressSame: boolean;
  
  // Billing Address (if different)
  billingFirstName: string;
  billingLastName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingCountry: string;
  
  // Terms
  agreeToTerms: boolean;
}

// Shipping cost calculation
const SHIPPING_COSTS: Record<'standard' | 'express' | 'overnight', number> = {
  standard: 7.99,
  express: 14.99,
  overnight: 19.99
};

// Free shipping thresholds
const FREE_SHIPPING_THRESHOLDS: Partial<Record<'standard' | 'express' | 'overnight', number>> = {
  standard: 75,
  express: 150
  // overnight shipping is never free
};

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { profile } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ')[1] || '',
    email: profile?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    shippingMethod: 'standard',
    
    paymentMethod: 'credit',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    billingAddressSame: true,
    
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'United States',
    
    agreeToTerms: false
  });

  // If the cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear any error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  // Calculate shipping cost based on method and cart total
  const calculateShippingCost = () => {
    const method = formData.shippingMethod;
    const threshold = FREE_SHIPPING_THRESHOLDS[method];
    if (threshold !== undefined && cartTotal >= threshold) {
      return 0; // Free shipping
    }
    return SHIPPING_COSTS[method];
  };

  // Calculate estimated tax (simplified as 8.25% of cart total)
  const calculateTax = () => {
    return cartTotal * 0.0825;
  };

  // Calculate order total
  const calculateTotal = () => {
    return cartTotal + calculateShippingCost() + calculateTax();
  };

  // Validate the current step of the form
  const validateStep = (step: 'shipping' | 'payment' | 'review'): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 'shipping') {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.email) errors.email = 'Email is required';
      if (!formData.phone) errors.phone = 'Phone number is required';
      if (!formData.address) errors.address = 'Address is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
      if (!formData.country) errors.country = 'Country is required';
    }
    
    if (step === 'payment') {
      if (formData.paymentMethod === 'credit') {
        if (!formData.cardName) errors.cardName = 'Name on card is required';
        if (!formData.cardNumber) errors.cardNumber = 'Card number is required';
        if (!formData.cardExpiry) errors.cardExpiry = 'Expiration date is required';
        if (!formData.cardCvc) errors.cardCvc = 'CVC is required';
      }
      
      if (!formData.billingAddressSame) {
        if (!formData.billingFirstName) errors.billingFirstName = 'First name is required';
        if (!formData.billingLastName) errors.billingLastName = 'Last name is required';
        if (!formData.billingAddress) errors.billingAddress = 'Address is required';
        if (!formData.billingCity) errors.billingCity = 'City is required';
        if (!formData.billingState) errors.billingState = 'State is required';
        if (!formData.billingZipCode) errors.billingZipCode = 'ZIP code is required';
        if (!formData.billingCountry) errors.billingCountry = 'Country is required';
      }
    }
    
    if (step === 'review') {
      if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Move to next step in checkout
  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      if (validateStep('shipping')) setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (validateStep('payment')) setCurrentStep('review');
    }
  };

  // Go back to previous step
  const handlePreviousStep = () => {
    if (currentStep === 'payment') setCurrentStep('shipping');
    if (currentStep === 'review') setCurrentStep('payment');
  };

  // Submit the order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep('review')) return;
    
    setIsSubmitting(true);
    
    try {
      // This would be where you'd integrate with a payment processor like Stripe
      // For now, we'll just simulate a successful order
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Generate a random order number
      const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the order confirmation details in session storage for the success page
      sessionStorage.setItem('orderConfirmation', JSON.stringify({
        orderNumber,
        orderDate: new Date().toISOString(),
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        shippingMethod: formData.shippingMethod,
        items: cartItems,
        subtotal: cartTotal,
        shipping: calculateShippingCost(),
        tax: calculateTax(),
        total: calculateTotal()
      }));
      
      // Clear the cart after successful checkout
      clearCart();
      
      // Redirect to order confirmation page
      router.push('/checkout/success');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress Bar
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'review'
              ? 'bg-[#76bfd4] text-white'
              : 'bg-[#ced1ff] text-gray-500'
          }`}>
            1
          </div>
          <span className="text-xs mt-1 text-[#24225c]">Shipping</span>
        </div>
        <div className={`h-1 w-16 ${
          currentStep === 'payment' || currentStep === 'review' ? 'bg-[#76bfd4]' : 'bg-[#ced1ff]'
        }`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 'payment' || currentStep === 'review'
              ? 'bg-[#76bfd4] text-white'
              : 'bg-[#ced1ff] text-gray-500'
          }`}>
            2
          </div>
          <span className="text-xs mt-1 text-[#24225c]">Payment</span>
        </div>
        <div className={`h-1 w-16 ${
          currentStep === 'review' ? 'bg-[#76bfd4]' : 'bg-[#ced1ff]'
        }`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 'review'
              ? 'bg-[#76bfd4] text-white'
              : 'bg-[#ced1ff] text-gray-500'
          }`}>
            3
          </div>
          <span className="text-xs mt-1 text-[#24225c]">Review</span>
        </div>
      </div>
    </div>
  );

  // Order Summary Component
  const OrderSummary = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-[#24225c] mb-4">Order Summary</h3>
      
      {/* Items count */}
      <div className="text-sm text-gray-600 mb-6">
        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
      </div>
      
      {/* Quick item list (limit to 3 with "and X more") */}
      <div className="mb-6 space-y-4">
        {cartItems.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center">
            <div className="relative h-12 w-12 rounded bg-gray-100 mr-3 overflow-hidden">
              {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                <Image
                  src={item.product.image_urls[0]}
                  alt={item.product?.name || ''}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              ) : null}
            </div>
            <div className="flex-grow">
              <div className="text-sm text-[#24225c] truncate">{item.product?.name}</div>
              <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
            </div>
            <div className="text-sm font-medium text-[#24225c]">
              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
        {cartItems.length > 3 && (
          <div className="text-sm text-[#b597ff]">
            and {cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>
      
      {/* Cost breakdown */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-[#24225c]">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          {currentStep === 'shipping' ? (
            <span className="text-gray-600">Calculated next</span>
          ) : (
            <span className="text-[#24225c]">${calculateShippingCost().toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated tax</span>
          {currentStep === 'shipping' ? (
            <span className="text-gray-600">Calculated next</span>
          ) : (
            <span className="text-[#24225c]">${calculateTax().toFixed(2)}</span>
          )}
        </div>
      </div>
      
      {/* Total */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <span className="font-semibold text-[#24225c]">Total</span>
          <span className="font-semibold text-[#24225c]">
            {currentStep === 'shipping' 
              ? `$${cartTotal.toFixed(2)}`
              : `$${calculateTotal().toFixed(2)}`
            }
          </span>
        </div>
      </div>
      
      {/* Back to cart link */}
      <div className="mt-6">
        <Link href="/cart" className="text-sm text-[#76bfd4] hover:underline inline-flex items-center">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to cart
        </Link>
      </div>
    </div>
  );

  // Shipping Step Form
  const renderShippingForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#24225c] mb-6">Shipping Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">First Name*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
        </div>
        
        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Last Name*</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>
        
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Phone*</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
        </div>
        
        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#24225c] mb-1">Address*</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
        </div>
        
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">City*</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
        </div>
        
        {/* State */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">State/Province*</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
        </div>
        
        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">ZIP/Postal Code*</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
        </div>
        
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Country*</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            {/* Add more countries as needed */}
          </select>
          {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
        </div>
      </div>
      
      {/* Shipping Methods */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[#24225c] mb-4">Shipping Method</h3>
        
        <div className="space-y-3">
          {/* Standard Shipping */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.shippingMethod === 'standard' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="shippingMethod"
              value="standard"
              checked={formData.shippingMethod === 'standard'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium text-[#24225c]">Standard Shipping</span>
                <span className="text-sm text-gray-600">3-5 business days</span>
              </div>              <div>
                {FREE_SHIPPING_THRESHOLDS.standard && cartTotal >= FREE_SHIPPING_THRESHOLDS.standard ? (
                  <span className="text-green-500 font-medium">FREE</span>
                ) : (
                  <span className="font-medium text-[#24225c]">${SHIPPING_COSTS.standard.toFixed(2)}</span>
                )}
              </div>
            </div>
          </label>
          
          {/* Express Shipping */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.shippingMethod === 'express' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="shippingMethod"
              value="express"
              checked={formData.shippingMethod === 'express'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium text-[#24225c]">Express Shipping</span>
                <span className="text-sm text-gray-600">1-2 business days</span>
              </div>              <div>
                {FREE_SHIPPING_THRESHOLDS.express && cartTotal >= FREE_SHIPPING_THRESHOLDS.express ? (
                  <span className="text-green-500 font-medium">FREE</span>
                ) : (
                  <span className="font-medium text-[#24225c]">${SHIPPING_COSTS.express.toFixed(2)}</span>
                )}
              </div>
            </div>
          </label>
          
          {/* Overnight Shipping */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.shippingMethod === 'overnight' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="shippingMethod"
              value="overnight"
              checked={formData.shippingMethod === 'overnight'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium text-[#24225c]">Overnight Shipping</span>
                <span className="text-sm text-gray-600">Next business day</span>
              </div>
              <div>
                <span className="font-medium text-[#24225c]">${SHIPPING_COSTS.overnight.toFixed(2)}</span>
              </div>
            </div>
          </label>
        </div>
      </div>
      
      {/* Continue Button */}
      <div className="mt-8">
        <button 
          type="button"
          onClick={handleNextStep}
          className="w-full bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  // Payment Step Form
  const renderPaymentForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#24225c] mb-6">Payment Information</h2>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#24225c] mb-3">Payment Method</h3>
        
        <div className="space-y-3">
          {/* Credit Card */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.paymentMethod === 'credit' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="credit"
              checked={formData.paymentMethod === 'credit'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center">
              <div className="flex-grow">
                <span className="block font-medium text-[#24225c]">Credit / Debit Card</span>
                <span className="text-sm text-gray-600">Visa, Mastercard, Amex, Discover</span>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </label>
          
          {/* PayPal */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.paymentMethod === 'paypal' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={formData.paymentMethod === 'paypal'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center">
              <div className="flex-grow">
                <span className="block font-medium text-[#24225c]">PayPal</span>
                <span className="text-sm text-gray-600">Pay with your PayPal account</span>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          </label>
        </div>
      </div>
      
      {/* Credit Card Details (shown only if credit card is selected) */}
      {formData.paymentMethod === 'credit' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#24225c] mb-3">Card Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* Name on Card */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Name on Card*</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardName && <p className="text-red-500 text-xs mt-1">{formErrors.cardName}</p>}
            </div>
            
            {/* Card Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Card Number*</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className={`w-full border ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>}
            </div>
            
            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Expiration Date*</label>
              <input
                type="text"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className={`w-full border ${formErrors.cardExpiry ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardExpiry && <p className="text-red-500 text-xs mt-1">{formErrors.cardExpiry}</p>}
            </div>
            
            {/* CVC */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">CVC*</label>
              <input
                type="text"
                name="cardCvc"
                value={formData.cardCvc}
                onChange={handleInputChange}
                placeholder="123"
                className={`w-full border ${formErrors.cardCvc ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardCvc && <p className="text-red-500 text-xs mt-1">{formErrors.cardCvc}</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Billing Address (with option to use shipping address) */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="billingAddressSame"
            id="billingAddressSame"
            checked={formData.billingAddressSame}
            onChange={handleInputChange}
            className="h-4 w-4 text-[#76bfd4]"
          />
          <label htmlFor="billingAddressSame" className="ml-2 text-sm font-medium text-[#24225c]">
            Billing address same as shipping address
          </label>
        </div>
        
        {/* Display billing address form if checkbox is unchecked */}
        {!formData.billingAddressSame && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">First Name*</label>
              <input
                type="text"
                name="billingFirstName"
                value={formData.billingFirstName}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingFirstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingFirstName && <p className="text-red-500 text-xs mt-1">{formErrors.billingFirstName}</p>}
            </div>
            
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Last Name*</label>
              <input
                type="text"
                name="billingLastName"
                value={formData.billingLastName}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingLastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingLastName && <p className="text-red-500 text-xs mt-1">{formErrors.billingLastName}</p>}
            </div>
            
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Address*</label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingAddress ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingAddress && <p className="text-red-500 text-xs mt-1">{formErrors.billingAddress}</p>}
            </div>
            
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">City*</label>
              <input
                type="text"
                name="billingCity"
                value={formData.billingCity}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingCity ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingCity && <p className="text-red-500 text-xs mt-1">{formErrors.billingCity}</p>}
            </div>
            
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">State/Province*</label>
              <input
                type="text"
                name="billingState"
                value={formData.billingState}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingState ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingState && <p className="text-red-500 text-xs mt-1">{formErrors.billingState}</p>}
            </div>
            
            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">ZIP/Postal Code*</label>
              <input
                type="text"
                name="billingZipCode"
                value={formData.billingZipCode}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingZipCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingZipCode && <p className="text-red-500 text-xs mt-1">{formErrors.billingZipCode}</p>}
            </div>
            
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Country*</label>
              <select
                name="billingCountry"
                value={formData.billingCountry}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingCountry ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                {/* Add more countries as needed */}
              </select>
              {formErrors.billingCountry && <p className="text-red-500 text-xs mt-1">{formErrors.billingCountry}</p>}
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          type="button"
          onClick={handlePreviousStep}
          className="w-full bg-gray-200 hover:bg-gray-300 text-[#24225c] font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Back
        </button>
        
        <button 
          type="button"
          onClick={handleNextStep}
          className="w-full bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );

  // Review Step
  const renderReviewForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#24225c] mb-6">Order Review</h2>
      
      {/* Shipping Information Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-[#24225c]">Shipping Information</h3>
          <button 
            onClick={() => setCurrentStep('shipping')}
            className="text-sm text-[#76bfd4] hover:underline"
          >
            Edit
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4">
          <p className="font-medium text-[#24225c]">{formData.firstName} {formData.lastName}</p>
          <p className="text-gray-700">{formData.address}</p>
          <p className="text-gray-700">
            {formData.city}, {formData.state} {formData.zipCode}
          </p>
          <p className="text-gray-700">{formData.country}</p>
          <p className="text-gray-700">{formData.email}</p>
          <p className="text-gray-700">{formData.phone}</p>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium text-[#24225c]">
              {formData.shippingMethod === 'standard' && 'Standard Shipping (3-5 business days)'}
              {formData.shippingMethod === 'express' && 'Express Shipping (1-2 business days)'}
              {formData.shippingMethod === 'overnight' && 'Overnight Shipping (Next business day)'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Payment Information Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-[#24225c]">Payment Information</h3>
          <button 
            onClick={() => setCurrentStep('payment')}
            className="text-sm text-[#76bfd4] hover:underline"
          >
            Edit
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4">
          {formData.paymentMethod === 'credit' ? (
            <div>
              <p className="font-medium text-[#24225c]">Credit Card</p>
              <p className="text-gray-700">
                {formData.cardNumber 
                  ? `**** **** **** ${formData.cardNumber.slice(-4)}` 
                  : 'Card number not provided'}
              </p>
              <p className="text-gray-700">
                {formData.cardName || 'Cardholder name not provided'}
              </p>
            </div>
          ) : (
            <p className="font-medium text-[#24225c]">PayPal</p>
          )}
          
          {/* Billing Address */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium text-[#24225c] mb-1">Billing Address</p>
            
            {formData.billingAddressSame ? (
              <p className="text-gray-700">Same as shipping address</p>
            ) : (
              <>
                <p className="text-gray-700">
                  {formData.billingFirstName} {formData.billingLastName}
                </p>
                <p className="text-gray-700">{formData.billingAddress}</p>
                <p className="text-gray-700">
                  {formData.billingCity}, {formData.billingState} {formData.billingZipCode}
                </p>
                <p className="text-gray-700">{formData.billingCountry}</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#24225c] mb-3">Order Items</h3>
        
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center">
              <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                  <Image
                    src={item.product.image_urls[0]}
                    alt={item.product?.name || ''}
                    fill
                    sizes="64px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : null}
              </div>
              <div className="flex-grow">
                <p className="text-base font-medium text-[#24225c]">{item.product?.name || 'Unknown Product'}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium text-[#24225c]">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Summary */}
      <div className="mb-6 bg-gray-50 rounded-md p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-[#24225c]">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="text-[#24225c]">${calculateShippingCost().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated tax</span>
            <span className="text-[#24225c]">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
            <span className="text-[#24225c]">Total</span>
            <span className="text-[#24225c]">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="mb-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            name="agreeToTerms"
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="h-4 w-4 mt-1 text-[#76bfd4]"
          />
          <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
            I agree to the <a href="#" className="text-[#76bfd4] hover:underline">Terms and Conditions</a> and <a href="#" className="text-[#76bfd4] hover:underline">Privacy Policy</a>
          </label>
        </div>
        {formErrors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{formErrors.agreeToTerms}</p>}
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          type="button"
          onClick={handlePreviousStep}
          className="w-full bg-gray-200 hover:bg-gray-300 text-[#24225c] font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Back
        </button>
        
        <button 
          type="submit"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className={`w-full font-semibold py-3 px-4 rounded text-white ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#b597ff] hover:bg-[#9f81ff] transition-colors duration-300'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </div>
      
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#24225c] mb-6">Checkout</h1>
      
      <ProgressIndicator />
      
      <form className="grid md:grid-cols-3 gap-8">
        {/* Main Content (varies by step) */}
        <div className="md:col-span-2">
          {currentStep === 'shipping' && renderShippingForm()}
          {currentStep === 'payment' && renderPaymentForm()}
          {currentStep === 'review' && renderReviewForm()}
        </div>
        
        {/* Order Summary (fixed) */}
        <div className="md:col-span-1">
          <OrderSummary />
        </div>
      </form>
    </div>
  );
}