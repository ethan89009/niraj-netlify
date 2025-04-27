import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, Lock, User } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Default role
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await signUp(
      formData.email,
      formData.password,
      formData.role,
      formData.firstName,
      formData.lastName
    );
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Create an account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            type="text"
            id="firstName"
            name="firstName"
            icon={<User size={16} />}
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            fullWidth
            error={errors.firstName}
          />
          
          <Input
            label="Last Name"
            type="text"
            id="lastName"
            name="lastName"
            icon={<User size={16} />}
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            fullWidth
            error={errors.lastName}
          />
        </div>
        
        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          icon={<Mail size={16} />}
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          fullWidth
          error={errors.email}
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          icon={<Lock size={16} />}
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          fullWidth
          error={errors.password}
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          icon={<Lock size={16} />}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          fullWidth
          error={errors.confirmPassword}
        />
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Register as
          </label>
          <select
            id="role"
            name="role"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/30 text-sm"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          fullWidth
        >
          Create Account
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/90">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;