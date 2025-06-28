import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ContactForm from './components/ContactForm';
import CandidatesList from './components/CandidatesList';

interface User {
  name: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentView, setCurrentView] = useState<'form' | 'candidates'>('form');

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Simulate login
    const newUser = { name: 'John Doe', email };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    setSuccessMessage('Successfully signed in!');
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 2000);
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Simulate signup
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    setSuccessMessage('Account created and signed in!');
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 2000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'form' ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Welcome to Ruhil Future Technologies
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Innovating tomorrow's solutions today. Connect with us to explore how we can transform your business with cutting-edge technology.
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('form')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    currentView === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Submit Application
                </button>
                <button
                  onClick={() => setCurrentView('candidates')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    currentView === 'candidates'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  View Candidates
                </button>
              </div>
            </div>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Sign In for Better Experience
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Please{' '}
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="font-medium underline hover:text-yellow-600"
                        >
                          sign in or create an account
                        </button>
                        {' '}to pre-fill your contact information and track your messages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ContactForm user={user} />

            <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Ruhil Future Technologies?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">🚀</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Innovation First</h4>
                  <p className="text-gray-600">We leverage the latest technologies to deliver cutting-edge solutions that drive your business forward.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fast Response</h4>
                  <p className="text-gray-600">Our dedicated team ensures quick turnaround times and responsive communication throughout your project.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">🎯</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Results Driven</h4>
                  <p className="text-gray-600">We focus on delivering measurable results that align with your business objectives and growth goals.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CandidatesList onBack={() => setCurrentView('form')} />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {showSuccessPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all animate-bounce">
          {successMessage}
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2025 Ruhil Future Technologies. All rights reserved. Ready to innovate?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Let's Connect
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;