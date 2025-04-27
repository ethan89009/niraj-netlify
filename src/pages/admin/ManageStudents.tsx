import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StudentCard from '../../components/StudentCard';
import { Search, Plus, UserRound } from 'lucide-react';
import { Profile } from '../../types';
import { toast } from 'sonner';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Profile | null;
  mentors: Profile[];
  onSave: (student: Profile) => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, student, mentors, onSave }) => {
  const [formData, setFormData] = useState<Partial<Profile>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    semester: 1,
    year_of_admission: new Date().getFullYear(),
    mentor_id: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone || '',
        semester: student.semester || 1,
        year_of_admission: student.year_of_admission || new Date().getFullYear(),
        mentor_id: student.mentor_id || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        semester: 1,
        year_of_admission: new Date().getFullYear(),
        mentor_id: '',
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'semester' || name === 'year_of_admission' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: student?.id || '',
      role: 'student',
    } as Profile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {student ? 'Edit Student' : 'Add New Student'}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Year of Admission"
                type="number"
                name="year_of_admission"
                value={formData.year_of_admission}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Mentor
              </label>
              <select
                name="mentor_id"
                value={formData.mentor_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select a Mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.first_name} {mentor.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {student ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('first_name');
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
        
        // Fetch mentors
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentor')
          .order('first_name');
        
        if (mentorsError) throw mentorsError;
        setMentors(mentorsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           student.email.toLowerCase().includes(searchLower) ||
           (student.phone && student.phone.includes(searchTerm));
  });

  const openAddModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Profile) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (studentData: Profile) => {
    try {
      if (studentData.id) {
        // Update existing student
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            email: studentData.email,
            phone: studentData.phone,
            semester: studentData.semester,
            year_of_admission: studentData.year_of_admission,
            mentor_id: studentData.mentor_id || null,
          })
          .eq('id', studentData.id);
        
        if (error) throw error;
        
        setStudents(students.map(s => s.id === studentData.id ? studentData : s));
        toast.success('Student updated successfully');
      } else {
        // In a real application, this would involve creating a user authentication record
        // and then creating the profile. For this demo, we'll just show a message.
        toast.info('In a real system, this would create a new student account');
        
        // Simulate adding to the list with a fake ID
        const newStudent = {
          ...studentData,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        
        setStudents([...students, newStudent]);
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
          <p className="text-muted-foreground">
            View and manage all students in the system.
          </p>
        </div>
        
        <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
          Add Student
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
              fullWidth
            />
          </div>
          
          {filteredStudents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map(student => (
                <div 
                  key={student.id}
                  onClick={() => openEditModal(student)}
                  className="cursor-pointer"
                >
                  <StudentCard student={student} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserRound className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No students match your search criteria" 
                  : "There are no students in the system yet"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={openAddModal}
              >
                Add a Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        mentors={mentors}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default ManageStudents;