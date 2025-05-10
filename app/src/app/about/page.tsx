'use client';

import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#24225c] mb-3">About MALIKLI1992</h1>
        <p className="text-lg text-gray-600">Exclusive drops, limited editions, and unique designs</p>
      </div>

      {/* Brand Story */}
      <div className="mb-16 bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Our Story</h2>
        <div className="prose prose-lg max-w-none text-[#24225c]">
          <p>
            Founded in 2025, MALIKLI1992 emerged from a passion for unique design and limited edition products.
            Our founder, inspired by the intersection of art, fashion, and technology, created a platform
            where customers can discover exclusive items available only for limited periods.
          </p>
          <p>
            What sets us apart is our drop model - carefully curated products released in small batches
            at scheduled times. Each drop represents our commitment to quality, uniqueness, and creativity.
          </p>
          <p>
            We collaborate with designers, artists, and creators from around the world to bring you
            products you won&apos;t find anywhere else. Every item tells a story and represents our
            dedication to offering something truly special.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-[#b597ff] mb-4">Our Mission</h2>
          <p className="text-[#24225c]">
            To create a community of enthusiasts who appreciate limited edition items,
            unique designs, and the thrill of catching exclusive drops before they&apos;re gone.
            We believe in quality over quantity, exclusivity over mass production, and
            the emotional connection between people and products they truly love.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-[#b597ff] mb-4">Our Vision</h2>
          <p className="text-[#24225c]">
            To become the premier destination for limited-edition products that push the boundaries
            of design and creativity, while building a passionate community around our drops.
            We envision a world where every purchase feels special and every customer feels like
            part of something exclusive.
          </p>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-[#ced1ff] bg-opacity-20 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-semibold text-[#24225c] mb-8 text-center">Our Values</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[#76bfd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Exclusivity</h3>
            <p className="text-[#24225c]">We create products in limited quantities to ensure each piece maintains its uniqueness and value.</p>
          </div>

          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[#76bfd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Quality</h3>
            <p className="text-[#24225c]">We never compromise on materials, craftsmanship, or attention to detail in our products.</p>
          </div>

          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[#76bfd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Community</h3>
            <p className="text-[#24225c]">We foster a passionate community of like-minded individuals who share our appreciation for unique items.</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-[#24225c] mb-8 text-center">Our Team</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="relative h-64 bg-gray-100">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 opacity-50"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg">Alex Johnson</h3>
                <p className="text-sm">Founder & Creative Director</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[#24225c] text-sm">
                Visionary entrepreneur with a background in fashion and technology.
                Alex leads our creative vision and product strategy.
              </p>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="relative h-64 bg-gray-100">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 opacity-50"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg">Taylor Rivera</h3>
                <p className="text-sm">Head of Design</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[#24225c] text-sm">
                Award-winning designer with expertise in sustainable materials and
                cutting-edge aesthetic trends.
              </p>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="relative h-64 bg-gray-100">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 opacity-50"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg">Morgan Chen</h3>
                <p className="text-sm">Community Manager</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[#24225c] text-sm">
                Social media expert and community builder who keeps our fans engaged
                and excited about upcoming drops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Community CTA */}
      <div className="bg-gradient-to-r from-[#24225c] to-[#b597ff] rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="mb-6 max-w-lg mx-auto">
          Be the first to know about our exclusive drops, get early access to limited editions,
          and join a community of enthusiasts who share your passion.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-[#24225c] w-full sm:w-64"
          />
          <button className="bg-white text-[#24225c] font-semibold px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
