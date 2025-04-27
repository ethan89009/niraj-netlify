import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Calendar as CalendarIcon, Search, Check, X } from 'lucide-react';
import { Profile, Subject } from '../../types';
import { toast } from 'sonner';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  students: Profile[];
  onSave: (attendance: { studentId: string; present: boolean }[]) => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ 
  isOpen, 
  onClose, 
  subject,
  students,
  onSave 
}) => {
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: boolean }>({});
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const attendance = Object.entries(attendanceData).map(([studentId, present]) => ({
      studentId,
      present,
    }));
    
    onSave(attendance);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">{subject.name}</h2>
              <p className="text-sm text-muted-foreground">
                Mark attendance for Semester {subject.semester}
              </p>
            </div>
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
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Student Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Student ID
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-4 py-2">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {student.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student.id)}
                            className={`p-2 rounded-full ${
                              attendanceData[student.id]
                                ? 'bg-success/10 text-success'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student.id)}
                            className={`p-2 rounded-full ${
                              !attendanceData[student.id]
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Attendance
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminAttendance: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('semester', { ascending: true });
        
        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('first_name');
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSubjects = subjects.filter(subject => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchLower) ||
      subject.code.toLowerCase().includes(searchLower)
    );
  });

  const openAttendanceModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async (attendance: { studentId: string; present: boolean }[]) => {
    if (!selectedSubject) return;

    try {
      const attendanceData = attendance.map(record => ({
        student_id: record.studentId,
        subject_id: selectedSubject.id,
        date: new Date().toISOString(),
        present: record.present,
      }));
      
      const { error } = await supabase
        .from('attendance')
        .insert(attendanceData);
      
      if (error) throw error;
      
      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Mark and manage student attendance for different subjects.
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
              fullWidth
            />
          </div>
          
          {filteredSubjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSubjects.map(subject => (
                <Card 
                  key={subject.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openAttendanceModal(subject)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{subject.name}</span>
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Code: {subject.code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Semester {subject.semester}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No subjects found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No subjects match your search criteria" 
                  : "There are no subjects in the system yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedSubject && (
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subject={selectedSubject}
          students={students}
          onSave={handleSaveAttendance}
        />
      )}
    </div>
  );
};

export default AdminAttendance;