import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, UserCog, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  studentCount: number;
  mentorCount: number;
  noticeCount: number;
  pendingLeaves: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    mentorCount: 0,
    noticeCount: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch student count
        const { count: studentCount, error: studentError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');
        
        if (studentError) throw studentError;
        
        // Fetch mentor count
        const { count: mentorCount, error: mentorError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'mentor');
        
        if (mentorError) throw mentorError;
        
        // Fetch notice count
        const { count: noticeCount, error: noticeError } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true });
        
        if (noticeError) throw noticeError;
        
        // Fetch pending leave applications
        const { count: pendingLeaves, error: leaveError } = await supabase
          .from('leave_applications')
          .select('*', { count: 'exact', head: true })
          .is('approved', null);
        
        if (leaveError) throw leaveError;
        
        // Fetch recent notices
        const { data: notices, error: recentNoticeError } = await supabase
          .from('notices')
          .select('*, profiles(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentNoticeError) throw recentNoticeError;
        
        setStats({
          studentCount: studentCount || 0,
          mentorCount: mentorCount || 0,
          noticeCount: noticeCount || 0,
          pendingLeaves: pendingLeaves || 0
        });
        
        setRecentNotices(notices || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total Students',
      value: stats.studentCount,
      icon: <Users className="h-8 w-8 text-primary" />,
      link: '/admin/students',
      color: 'bg-primary/10'
    },
    {
      title: 'Total Mentors',
      value: stats.mentorCount,
      icon: <UserCog className="h-8 w-8 text-secondary" />,
      link: '/admin/mentors',
      color: 'bg-secondary/10'
    },
    {
      title: 'Notices Published',
      value: stats.noticeCount,
      icon: <Bell className="h-8 w-8 text-warning" />,
      link: '/admin/notices',
      color: 'bg-warning/10'
    },
    {
      title: 'Pending Leave Applications',
      value: stats.pendingLeaves,
      icon: <FileText className="h-8 w-8 text-destructive" />,
      link: '#',
      color: 'bg-destructive/10'
    }
  ];

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
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the Student-Mentor Management System
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotices.length > 0 ? (
              <div className="space-y-4">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="border-b pb-3 last:border-0">
                    <h3 className="font-semibold">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        By {notice.profiles?.first_name} {notice.profiles?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No notices available</p>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link 
                to="/admin/students" 
                className="block p-3 bg-primary/5 hover:bg-primary/10 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>Manage Students</span>
                </div>
              </Link>
              <Link 
                to="/admin/mentors" 
                className="block p-3 bg-secondary/5 hover:bg-secondary/10 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <UserCog className="h-5 w-5 mr-2 text-secondary" />
                  <span>Manage Mentors</span>
                </div>
              </Link>
              <Link 
                to="/admin/notices" 
                className="block p-3 bg-warning/5 hover:bg-warning/10 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-warning" />
                  <span>Publish Notice</span>
                </div>
              </Link>
              <Link 
                to="/admin/marks" 
                className="block p-3 bg-success/5 hover:bg-success/10 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-success" />
                  <span>Upload Marks</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;