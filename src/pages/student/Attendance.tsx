import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Subject } from '../../types';

interface AttendanceRecord {
  id: string;
  date: string;
  present: boolean;
  subject: Subject;
}

const StudentAttendance: React.FC = () => {
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('attendance')
          .select(`
            *,
            subject:subject_id (
              id,
              name,
              code,
              semester
            )
          `)
          .eq('student_id', currentUser.id)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        setAttendance(data || []);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [currentUser]);

  const calculateAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(record => record.present).length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    
    return {
      total,
      present,
      absent: total - present,
      percentage: Math.round(percentage),
    };
  };

  const stats = calculateAttendanceStats();

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
          View your attendance records and statistics.
        </p>
      </div>

      {/* Attendance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length > 0 ? (
            <div className="space-y-4">
              {attendance.map(record => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {record.present ? (
                          <div className="bg-success/10 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                        ) : (
                          <div className="bg-destructive/10 p-2 rounded-full">
                            <XCircle className="h-5 w-5 text-destructive" />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-medium">{record.subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {record.subject.code}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(record.date), 'PP')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No attendance records</h3>
              <p className="text-muted-foreground">
                Your attendance records will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendance;