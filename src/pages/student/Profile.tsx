import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { UserRound, Mail, PhoneCall, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const StudentProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.profile?.first_name || '',
    lastName: currentUser?.profile?.last_name || '',
    phone: currentUser?.profile?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.profile) {
    return (
      <div className="text-center py-12">
        <UserRound className="mx-auto h-12 w-12 text-muted" />
        <h3 className="mt-4 text-lg font-medium">Profile not found</h3>
        <p className="text-muted-foreground">
          Unable to load your profile information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your profile information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  icon={<UserRound size={16} />}
                  fullWidth
                />
                
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  icon={<UserRound size={16} />}
                  fullWidth
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                value={currentUser.profile.email}
                icon={<Mail size={16} />}
                disabled
                fullWidth
              />
              
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={<PhoneCall size={16} />}
                fullWidth
              />
              
              <Button 
                type="submit" 
                variant="primary"
                icon={<Save size={16} />}
                isLoading={loading}
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium">Current Semester</span>
              </div>
              <span className="text-sm">
                Semester {currentUser.profile.semester}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium">Year of Admission</span>
              </div>
              <span className="text-sm">
                {currentUser.profile.year_of_admission}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <UserRound className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium">Student ID</span>
              </div>
              <span className="text-sm">
                {currentUser.profile.id.substring(0, 8)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;