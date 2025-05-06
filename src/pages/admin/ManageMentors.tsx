import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import MentorCard from '../../components/MentorCard';
import { Search, Plus, UserCog } from 'lucide-react';
import { Profile } from '../../types';
import { toast } from 'sonner';

interface MentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Profile | null;
  onSave: (mentor: Profile) => void;
}

const MentorModal: React.FC<MentorModalProps> = ({ isOpen, onClose, mentor, onSave }) => {
  const [formData, setFormData] = useState<Partial<Profile>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (mentor) {
      setFormData({
        first_name: mentor.first_name,
        last_name: mentor.last_name,
        email: mentor.email,
        phone: mentor.phone || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      });
    }
  }, [mentor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: mentor?.id || '',
      role: 'mentor',
    } as Profile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {mentor ? 'Edit Mentor' : 'Add New Mentor'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary">
                {mentor ? 'Update Mentor' : 'Add Mentor'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ManageMentors: React.FC = () => {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [mentorCounts, setMentorCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch mentors
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentor')
          .order('first_name');
        
        if (mentorsError) throw mentorsError;
        setMentors(mentorsData || []);
        
        // Fetch mentee counts for each mentor
        const countsMap: Record<string, number> = {};
        
        if (mentorsData && mentorsData.length > 0) {
          const mentorIds = mentorsData.map(mentor => mentor.id);
          
          const { data: menteeCounts, error: countError } = await supabase
            .from('profiles')
            .select('mentor_id, count')
            .eq('role', 'student')
            .in('mentor_id', mentorIds)
            .group('mentor_id');
          
          if (countError) throw countError;
          
          if (menteeCounts) {
            menteeCounts.forEach(item => {
              countsMap[item.mentor_id] = item.count;
            });
          }
        }
        
        setMentorCounts(countsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch mentors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMentors = mentors.filter(mentor => {
    const fullName = `${mentor.first_name} ${mentor.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           mentor.email.toLowerCase().includes(searchLower) ||
           (mentor.phone && mentor.phone.includes(searchTerm));
  });

  const openAddModal = () => {
    setSelectedMentor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (mentor: Profile) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const handleSaveMentor = async (mentorData: Profile) => {
    try {
      if (mentorData.id) {
        // Update existing mentor
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: mentorData.first_name,
            last_name: mentorData.last_name,
            email: mentorData.email,
            phone: mentorData.phone,
          })
          .eq('id', mentorData.id);
        
        if (error) throw error;
        
        setMentors(mentors.map(m => m.id === mentorData.id ? mentorData : m));
        toast.success('Mentor updated successfully');
      } else {
        // In a real application, this would involve creating a user authentication record
        // and then creating the profile. For this demo, we'll just show a message.
        toast.info('In a real system, this would create a new mentor account');
        
        // Simulate adding to the list with a fake ID
        const newMentor = {
          ...mentorData,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.functions.invoke('hello-world', {
          body: { name: 'Functions' },
        })

        if (error) throw error;
        console.log('Function response:', data);
        toast.success('Mentor added successfully');
        
        setMentors([...mentors, newMentor]);
      }
    } catch (error) {
      console.error('Error saving mentor:', error);
      toast.error('Failed to save mentor');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Mentors</h1>
          <p className="text-muted-foreground">
            View and manage all mentors in the system.
          </p>
        </div>
        
        <Button variant="secondary" icon={<Plus size={16} />} onClick={openAddModal}>
          Add Mentor
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
              fullWidth
            />
          </div>
          
          {filteredMentors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map(mentor => (
                <div 
                  key={mentor.id}
                  onClick={() => openEditModal(mentor)}
                  className="cursor-pointer"
                >
                  <MentorCard 
                    mentor={mentor} 
                    menteeCount={mentorCounts[mentor.id] || 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCog className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No mentors found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No mentors match your search criteria" 
                  : "There are no mentors in the system yet"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={openAddModal}
              >
                Add a Mentor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <MentorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mentor={selectedMentor}
        onSave={handleSaveMentor}
      />
    </div>
  );
};

export default ManageMentors;