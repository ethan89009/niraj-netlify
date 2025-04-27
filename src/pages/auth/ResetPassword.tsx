import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Lock } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updatePassword, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await updatePassword(password);
    
    // Redirect to login page after password reset
    navigate('/login');
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Set New Password
      </h2>
      
      <p className="text-sm text-gray-600 mb-6">
        Enter your new password below.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          id="password"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          fullWidth
          error={errors.password}
        />
        
        <Input
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          icon={<Lock size={16} />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          fullWidth
          error={errors.confirmPassword}
        />
        
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          fullWidth
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;