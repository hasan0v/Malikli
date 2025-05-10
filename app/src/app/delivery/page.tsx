'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
}

export default function DeliveryPage() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  
  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };
  
  const faqs: FAQ[] = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within the US. Express shipping takes 1-2 business days, and overnight shipping delivers the next business day. International shipping times vary by destination, typically taking 7-14 business days."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by location. Please note that customers are responsible for any customs duties or import taxes that may apply."
    },
    {
      question: "Can I change my shipping address after placing an order?",
      answer: "Address changes can be made if the order hasn't shipped yet. Please contact our customer service team immediately if you need to make any changes to your shipping address."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order by logging into your account and viewing your order history."
    },
    {
      question: "What if my package is lost or damaged?",
      answer: "If your package appears to be lost or arrives damaged, please contact our customer service within 48 hours. We'll work with our shipping partners to resolve the issue promptly."
    },
    {
      question: "Do you offer free shipping?",
      answer: "We offer free standard shipping on orders over $75 and free express shipping on orders over $150. Promotional free shipping offers may be available during special events."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#24225c] mb-3">Delivery Information</h1>
        <p className="text-lg text-gray-600">Shipping policies, delivery options, and more</p>
      </div>
      
      {/* Shipping Options */}
      <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Shipping Options</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Standard Shipping */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="text-[#b597ff] mb-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Standard Shipping</h3>
            <p className="text-gray-600 mb-3">3-5 business days</p>
            <p className="font-medium text-[#24225c]">$7.99</p>
            <p className="text-sm text-green-600 mt-2">Free on orders over $75</p>
          </div>
          
          {/* Express Shipping */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="text-[#b597ff] mb-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Express Shipping</h3>
            <p className="text-gray-600 mb-3">1-2 business days</p>
            <p className="font-medium text-[#24225c]">$14.99</p>
            <p className="text-sm text-green-600 mt-2">Free on orders over $150</p>
          </div>
          
          {/* Overnight Shipping */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="text-[#b597ff] mb-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Overnight Shipping</h3>
            <p className="text-gray-600 mb-3">Next business day</p>
            <p className="font-medium text-[#24225c]">$19.99</p>
          </div>
        </div>
        
        <div className="bg-[#ced1ff] bg-opacity-20 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-[#24225c] mb-3">Important Shipping Notes</h3>
          <ul className="list-disc pl-5 space-y-2 text-[#24225c]">
            <li>Orders placed after 2:00 PM EST will be processed the following business day.</li>
            <li>Business days are Monday through Friday, excluding holidays.</li>
            <li>Limited edition drops may have special shipping timeframes that will be noted on the product page.</li>
            <li>We ship from our warehouse in Los Angeles, CA.</li>
          </ul>
        </div>
      </div>
      
      {/* International Shipping */}
      <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">International Shipping</h2>
        
        <p className="text-[#24225c] mb-4">
          We ship to most countries worldwide. International shipping costs are calculated at checkout based on destination,
          weight, and chosen shipping method. Delivery typically takes 7-14 business days, depending on location and customs processing.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#ced1ff] bg-opacity-20 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#24225c] mb-3">Customs & Import Duties</h3>
            <p className="text-[#24225c]">
              International customers may be subject to import duties and taxes, which are collected 
              once the package reaches your country. These additional charges are the responsibility 
              of the recipient and are not included in our shipping rates.
            </p>
          </div>
          
          <div className="bg-[#ced1ff] bg-opacity-20 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#24225c] mb-3">Tracking International Orders</h3>
            <p className="text-[#24225c]">
              All international shipments include tracking. Once your order ships, you'll receive 
              tracking information via email. Please note that tracking updates may be limited 
              once a package enters customs in the destination country.
            </p>
          </div>
        </div>
      </div>
      
      {/* Order Tracking */}
      <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Track Your Order</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-[#24225c] mb-4">
              After your order ships, you'll receive a shipping confirmation email with tracking information.
              You can also track your order by entering your order number and email below or by visiting your account dashboard.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#24225c] mb-1">Order Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
                  placeholder="e.g., ML1992-123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#24225c] mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
              
              <button className="bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-2 px-4 rounded transition-colors duration-300 mt-2">
                Track Order
              </button>
            </div>
          </div>
          
          <div className="bg-[#ced1ff] bg-opacity-20 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#24225c] mb-3">Order Status Definitions</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-yellow-500 mt-0.5 mr-2 flex-shrink-0"></span>
                <div>
                  <span className="font-medium text-[#24225c]">Processing</span>
                  <p className="text-sm text-gray-600">Your order has been received and is being prepared.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-blue-500 mt-0.5 mr-2 flex-shrink-0"></span>
                <div>
                  <span className="font-medium text-[#24225c]">Shipped</span>
                  <p className="text-sm text-gray-600">Your order is on its way to you.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-green-500 mt-0.5 mr-2 flex-shrink-0"></span>
                <div>
                  <span className="font-medium text-[#24225c]">Delivered</span>
                  <p className="text-sm text-gray-600">Your order has been delivered successfully.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-red-500 mt-0.5 mr-2 flex-shrink-0"></span>
                <div>
                  <span className="font-medium text-[#24225c]">Issue</span>
                  <p className="text-sm text-gray-600">There's a problem with your delivery.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Shipping FAQ */}
      <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button 
                className="flex justify-between items-center w-full px-6 py-4 text-left font-medium text-[#24225c] hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleQuestion(index)}
              >
                <span>{faq.question}</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${activeQuestion === index ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeQuestion === index && (
                <div className="px-6 pb-4 text-[#24225c]">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-[#24225c] to-[#b597ff] rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Need More Help?</h2>
        <p className="mb-6">
          Our customer service team is available to answer any questions about shipping and delivery.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="#" className="bg-white text-[#24225c] font-semibold px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300">
            Contact Support
          </Link>
          <Link href="#" className="border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-[#24225c] transition-colors duration-300">
            Chat With Us
          </Link>
        </div>
      </div>
    </div>
  );
}
