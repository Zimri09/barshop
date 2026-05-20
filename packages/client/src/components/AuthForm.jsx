import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { normalizeLoginIdentifier } from '../utils/authIdentifier';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(normalizeLoginIdentifier(email), password);
        alert('Sign up successful! Check your email.');
      } else {
        await signIn(normalizeLoginIdentifier(email), password);
        alert('Signed in successfully!');
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
      <img src="https://images.unsplash.com/photo-1602524811839-f957473d04d4?auto=format&fit=crop&w=800&q=80" alt="Login illustration" className="w-full h-48 object-cover rounded-t-md mb-4" />
      <h2 className="text-2xl font-bold mb-4 text-white">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <h2 className="text-2xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email or username</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
          placeholder="you@example.com or username"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
      </button>

      <p className="mt-4 text-center text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="ml-2 text-blue-600 hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </form>
  );
}
