import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase }from '../lib/supabase'
import { User } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setCurrentUser(null);
        return;
      }
      
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        setCurrentUser(null);
        return;
      }
      
      setCurrentUser({
        id: session.user.id,
        email: session.user.email || '',
        role: profile.role,
        profile: profile
      });
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        setCurrentUser({
          id: data.user.id,
          email: data.user.email || '',
          role: profile.role,
          profile: profile
        });
        
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      // Check if registration is allowed for this role
      if (role === 'admin') {
        throw new Error('Admin registration is not allowed');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role,
          });
        
        if (profileError) throw profileError;
        
        toast.success('Account created successfully. Please log in.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setCurrentUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
      console.error('Update password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};