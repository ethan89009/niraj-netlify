import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StudentCard from '../../components/StudentCard';
import NoticeCard from '../../components/NoticeCard';
import { Users, Calendar, Clock, BellRing } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile, Notice, MentoringSession } from '../../types';

const MentorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [mentees, setMentees] = useState<Profile[]>([]);
  const [menteesWithBlocklogs, setMenteesWithBlocklogs] = useState<string[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<MentoringSession[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Fetch mentees
        const { data: menteesData, error: menteesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('mentor_id', currentUser.id)
          .eq('role', 'student');

        if (menteesError) throw menteesError;
        setMentees(menteesData || []);

        // For demo, we'll randomly set some students as having blocklogs
        if (menteesData && menteesData.length > 0) {
          const randomMentees = menteesData
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.max(1, Math.floor(menteesData.length / 3)))
            .map(student => student.id);

          setMenteesWithBlocklogs(randomMentees);
        }

        // Fetch upcoming mentoring sessions
        const today = new Date().toISOString();
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('mentoring_sessions')
          .select(`
            *,
            profiles:student_id (
              first_name,
              last_name
            )
          `)
          .eq('mentor_id', currentUser.id)
          .gte('date', today)
          .order('date')
          .limit(5);

        if (sessionsError) throw sessionsError;
        setUpcomingSessions(sessionsData || []);

        // Fetch recent notices
        const { data: noticesData, error: noticesError } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (noticesError) throw noticesError;
        setNotices(noticesData || []);

        // Fetch pending leave applications count
        const { count, error: leavesError } = await supabase
          .from('leave_applications')
          .select('*', { count: 'exact', head: true })
          .is('approved', null)
          .in('student_id', menteesData?.map(m => m.id) || []);

        if (leavesError) throw leavesError;
        setPendingLeaves(count || 0);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const handleStudentClick = (studentId: string) => {
    navigate(`/mentor/mentees/${studentId}`);
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.profile?.first_name} {currentUser?.profile?.last_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentees.length}</div>
            <p className="text-xs text-muted-foreground">
              {menteesWithBlocklogs.length} with blocklogs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              In the next 14 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">
              Require your approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mentees with Blocklogs */}
      {menteesWithBlocklogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-destructive flex items-center">
              <BellRing className="h-5 w-5 mr-2" />
              Mentees Requiring Attention
            </h2>
            <Link to="/mentor/mentees" className="text-sm text-secondary hover:underline">
              View All Mentees
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {mentees
              .filter(mentee => menteesWithBlocklogs.includes(mentee.id))
              .map(mentee => (
                <StudentCard 
                  key={mentee.id} 
                  student={mentee} 
                  hasBlocklogs={true}
                  onClick={() => handleStudentClick(mentee.id)}
                />
              ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Mentoring Sessions</h2>
            <Link to="/mentor/sessions" className="text-sm text-secondary hover:underline">
              Manage Sessions
            </Link>
          </div>
          {upcomingSessions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            With {session.profiles?.first_name} {session.profiles?.last_name}
                          </p>
                        </div>
                        <div className="text-sm">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No upcoming sessions scheduled
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Notices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Notices</h2>
          </div>
          {notices.length > 0 ? (
            <div className="space-y-4">
              {notices.slice(0, 1).map(notice => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No recent notices
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;