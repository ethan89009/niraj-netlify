import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, loading } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await signIn(email, password);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Log in to your account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          id="email"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          fullWidth
          error={errors.email}
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          fullWidth
          error={errors.password}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="text-primary hover:text-primary/90">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          fullWidth
        >
          Sign in
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary/90">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;