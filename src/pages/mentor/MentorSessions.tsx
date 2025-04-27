import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { Calendar, Clock, Plus, Search } from 'lucide-react';
import { MentoringSession, Profile } from '../../types';
import { toast } from 'sonner';
import Input from '../../components/ui/Input';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MentoringSession | null;
  mentees: Profile[];
  onSave: (session: MentoringSession) => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, session, mentees, onSave }) => {
  const [formData, setFormData] = useState<Partial<MentoringSession>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    student_id: '',
    notes: '',
  });

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title,
        date: format(new Date(session.date), 'yyyy-MM-dd'),
        student_id: session.student_id,
        notes: session.notes || '',
      });
    } else {
      setFormData({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        student_id: mentees.length > 0 ? mentees[0].id : '',
        notes: '',
      });
    }
  }, [session, mentees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id) {
      toast.error('Please select a mentee');
      return;
    }
    
    onSave({
      ...formData,
      id: session?.id || '',
      mentor_id: session?.mentor_id || '',
    } as MentoringSession);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {session ? 'Edit Mentoring Session' : 'Schedule New Session'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Mentee
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="">Select a Mentee</option>
                {mentees.map((mentee) => (
                  <option key={mentee.id} value={mentee.id}>
                    {mentee.first_name} {mentee.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary">
                {session ? 'Update Session' : 'Schedule Session'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MentorSessions: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [mentees, setMentees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MentoringSession | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Fetch all mentees
        const { data: menteesData, error: menteesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('mentor_id', currentUser.id)
          .eq('role', 'student');
        
        if (menteesError) throw menteesError;
        setMentees(menteesData || []);
        
        // Fetch all mentoring sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('mentoring_sessions')
          .select(`
            *,
            student:student_id (
              first_name,
              last_name,
              email
            )
          `)
          .eq('mentor_id', currentUser.id)
          .order('date', { ascending: false });
        
        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSessions = sessions.filter(session => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.title.toLowerCase().includes(searchLower) ||
      (session.student?.first_name + ' ' + session.student?.last_name).toLowerCase().includes(searchLower) ||
      (session.notes && session.notes.toLowerCase().includes(searchLower))
    );
  });

  const openAddModal = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const openEditModal = (session: MentoringSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleSaveSession = async (sessionData: MentoringSession) => {
    if (!currentUser) return;

    try {
      if (sessionData.id) {
        // Update existing session
        const { error } = await supabase
          .from('mentoring_sessions')
          .update({
            title: sessionData.title,
            date: sessionData.date,
            student_id: sessionData.student_id,
            notes: sessionData.notes,
          })
          .eq('id', sessionData.id);
        
        if (error) throw error;
        
        // Update the sessions list
        setSessions(
          sessions.map(s => (s.id === sessionData.id ? { ...s, ...sessionData } : s))
        );
        
        toast.success('Session updated successfully');
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('mentoring_sessions')
          .insert({
            mentor_id: currentUser.id,
            student_id: sessionData.student_id,
            title: sessionData.title,
            date: sessionData.date,
            notes: sessionData.notes,
          })
          .select(`
            *,
            student:student_id (
              first_name,
              last_name,
              email
            )
          `);
        
        if (error) throw error;
        
        // Add the new session to the list
        if (data) {
          setSessions([...data, ...sessions]);
        }
        
        toast.success('Session scheduled successfully');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
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
          <h1 className="text-3xl font-bold tracking-tight">Mentoring Sessions</h1>
          <p className="text-muted-foreground">
            Schedule and manage your mentoring sessions.
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          icon={<Plus size={16} />}
          onClick={openAddModal}
          disabled={mentees.length === 0}
        >
          Schedule Session
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions by title, mentee, or notes..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
              fullWidth
            />
          </div>
          
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openEditModal(session)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(session.date), 'PP')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xs font-semibold mr-2">
                          {session.student?.first_name?.[0]}{session.student?.last_name?.[0]}
                        </div>
                        <span className="text-sm">
                          {session.student?.first_name} {session.student?.last_name}
                        </span>
                      </div>
                      
                      {session.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {session.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No sessions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "No sessions match your search criteria" 
                  : mentees.length === 0 
                    ? "You don't have any mentees assigned yet"
                    : "You haven't scheduled any mentoring sessions yet"}
              </p>
              {mentees.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={openAddModal}
                >
                  Schedule Your First Session
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
        mentees={mentees}
        onSave={handleSaveSession}
      />
    </div>
  );
};

export default MentorSessions;