'use client';

import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <Image src="/icon.png" alt="AR TOUR UVG" width={48} height={48} className="h-12 w-12 rounded-full" />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-white">
              AR TOUR UVG
            </h1>
            <h2 className="text-3xl font-extrabold text-white">
              Beacons Manager
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Sistema de gestión de sensores por niveles del CIT
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 fade-in border border-gray-700">
            {/* Tab Navigation */}
            {/* <div className="flex mb-8 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all duration-200 ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all duration-200 ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div> */}
            
            {/* Form Content */}
            <div className="space-y-6">
              {isLogin ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Built with Next.js, TypeScript & PostgreSQL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
