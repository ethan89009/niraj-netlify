import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, loading } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await resetPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Reset your password
      </h2>
      
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="rounded-full bg-success/10 p-3 w-16 h-16 flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-success" />
          </div>
          
          <p className="text-sm text-gray-600 my-4">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and follow the instructions to reset your password.
          </p>
          
          <Link
            to="/login"
            className="text-primary hover:text-primary/90 flex items-center justify-center gap-2 mt-4"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
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
            
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              fullWidth
            >
              Send Reset Link
            </Button>
            
            <Link
              to="/login"
              className="text-primary hover:text-primary/90 flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;