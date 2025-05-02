import { SignUpForm } from '@/components/auth/SignUpForm';
import React from 'react';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex justify-center items-start pt-10 md:pt-16">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <SignUpForm />
         {/* Optional: Add link to Sign In */}
         <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;