import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import PerformanceChart from '../../components/PerformanceChart';
import { UserRound, Mail, PhoneCall, Calendar, BookOpen, Clock } from 'lucide-react';
import { Profile, MentoringSession } from '../../types';
import { format } from 'date-fns';

const MenteeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mentee, setMentee] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const performanceData = {
    labels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
    datasets: [
      {
        label: 'CGPA',
        data: [8.2, 8.5, 8.1, 8.7],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
      },
    ],
  };

  const attendanceData = {
    labels: ['Math', 'Physics', 'Chemistry', 'Computer Science', 'English'],
    datasets: [
      {
        label: 'Attendance Percentage',
        data: [85, 90, 75, 95, 88],
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
      },
    ],
  };

  useEffect(() => {
    const fetchMenteeData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch mentee profile
        const { data: menteeData, error: menteeError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (menteeError) throw menteeError;
        setMentee(menteeData);

        // Fetch mentoring sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('mentoring_sessions')
          .select('*')
          .eq('student_id', id)
          .order('date', { ascending: false });

        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);

      } catch (error) {
        console.error('Error fetching mentee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenteeData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!mentee) {
    return (
      <div className="text-center py-12">
        <UserRound className="mx-auto h-12 w-12 text-muted" />
        <h3 className="mt-4 text-lg font-medium">Mentee not found</h3>
        <p className="text-muted-foreground">
          The mentee you're looking for doesn't exist or you don't have access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {mentee.first_name} {mentee.last_name}
        </h1>
        <p className="text-muted-foreground">
          Mentee Profile and Performance Overview
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Student ID: {mentee.id.substring(0, 8)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{mentee.email}</span>
              </div>
              
              {mentee.phone && (
                <div className="flex items-center text-sm">
                  <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{mentee.phone}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Semester {mentee.semester}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Admitted in {mentee.year_of_admission}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart 
          title="Academic Performance" 
          data={performanceData} 
          type="line" 
        />
        <PerformanceChart 
          title="Attendance Overview" 
          data={attendanceData} 
          type="bar" 
        />
      </div>

      {/* Mentoring Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mentoring Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map(session => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.date), 'PPP')}
                        </p>
                      </div>
                    </div>
                    {session.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        {session.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-muted-foreground">
                No mentoring sessions recorded yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenteeProfile;