import { SignInForm } from '@/components/auth/SignInForm';
import React from 'react';

const SignInPage: React.FC = () => {
  return (
    <div className="flex justify-center items-start pt-10 md:pt-16">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <SignInForm />
        {/* Optional: Add link to Sign Up */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;