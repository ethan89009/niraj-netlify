import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import NoticeCard from '../../components/NoticeCard';
import PerformanceChart from '../../components/PerformanceChart';
import { Calendar, BookOpen, CheckSquare, AlertTriangle, UserCog } from 'lucide-react';
import { Notice, Profile } from '../../types';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [mentor, setMentor] = useState<Profile | null>(null);
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    total: 0,
  });
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

  const subjectPerformanceData = {
    labels: ['Math', 'Physics', 'Chemistry', 'Computer Science', 'English'],
    datasets: [
      {
        label: 'Current Semester Marks',
        data: [85, 75, 82, 90, 88],
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
      },
    ],
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Fetch recent notices
        const { data: noticesData, error: noticesError } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (noticesError) throw noticesError;
        setNotices(noticesData || []);

        // Fetch mentor info
        if (currentUser.profile?.mentor_id) {
          const { data: mentorData, error: mentorError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.profile.mentor_id)
            .single();

          if (mentorError) throw mentorError;
          setMentor(mentorData);
        }

        // Fetch attendance summary
        const { data: attendanceCount, error: attendanceError } = await supabase
          .from('attendance')
          .select('present')
          .eq('student_id', currentUser.id);

        if (attendanceError) throw attendanceError;

        if (attendanceCount) {
          const present = attendanceCount.filter(a => a.present).length;
          setAttendanceData({
            present,
            absent: attendanceCount.length - present,
            total: attendanceCount.length
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

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
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.profile?.first_name} {currentUser?.profile?.last_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData.total ? Math.round((attendanceData.present / attendanceData.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {attendanceData.present} present out of {attendanceData.total} classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUser?.profile?.semester || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentUser?.profile?.year_of_admission ? `Since ${currentUser.profile.year_of_admission}` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Credits</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              72
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 120 total credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Backlog Subjects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0
            </div>
            <p className="text-xs text-muted-foreground">
              All subjects cleared
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Information */}
      {mentor && (
        <Card className="border border-secondary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="h-5 w-5 mr-2 text-secondary" />
              Your Mentor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-semibold">
                {mentor.first_name[0]}{mentor.last_name[0]}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">{mentor.first_name} {mentor.last_name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.email}</p>
                {mentor.phone && <p className="text-sm text-muted-foreground">{mentor.phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <PerformanceChart 
          title="Academic Performance" 
          data={performanceData} 
          type="line" 
        />
        <PerformanceChart 
          title="Current Semester Subjects" 
          data={subjectPerformanceData} 
          type="bar" 
        />
      </div>

      {/* Notices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Notices</h2>
          <Link to="#" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map(notice => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
          {notices.length === 0 && (
            <p className="text-muted-foreground col-span-full">No recent notices</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;