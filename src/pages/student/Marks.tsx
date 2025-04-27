import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import PerformanceChart from '../../components/PerformanceChart';
import { FileSpreadsheet } from 'lucide-react';
import { Subject } from '../../types';

interface MarksRecord {
  id: string;
  marks: number;
  type: 'internal' | 'semester';
  semester: number;
  subject: Subject;
}

const StudentMarks: React.FC = () => {
  const { currentUser } = useAuth();
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('marks')
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
          .order('semester', { ascending: true });
        
        if (error) throw error;
        
        setMarks(data || []);
      } catch (error) {
        console.error('Error fetching marks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarks();
  }, [currentUser]);

  const calculateSemesterPerformance = () => {
    const semesterMarks = marks.reduce((acc, mark) => {
      if (!acc[mark.semester]) {
        acc[mark.semester] = {
          total: 0,
          count: 0,
        };
      }
      acc[mark.semester].total += mark.marks;
      acc[mark.semester].count += 1;
      return acc;
    }, {} as Record<number, { total: number; count: number }>);

    return Object.entries(semesterMarks).map(([semester, data]) => ({
      semester: Number(semester),
      average: data.total / data.count,
    }));
  };

  const semesterPerformance = calculateSemesterPerformance();

  const performanceData = {
    labels: semesterPerformance.map(sem => `Semester ${sem.semester}`),
    datasets: [
      {
        label: 'Average Marks',
        data: semesterPerformance.map(sem => sem.average),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
      },
    ],
  };

  const subjectPerformanceData = {
    labels: marks.filter(mark => mark.semester === currentUser?.profile?.semester)
      .map(mark => mark.subject.name),
    datasets: [
      {
        label: 'Current Semester Marks',
        data: marks.filter(mark => mark.semester === currentUser?.profile?.semester)
          .map(mark => mark.marks),
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
      },
    ],
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
        <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
        <p className="text-muted-foreground">
          View your academic performance and marks.
        </p>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart 
          title="Overall Performance" 
          data={performanceData} 
          type="line" 
        />
        <PerformanceChart 
          title="Current Semester Performance" 
          data={subjectPerformanceData} 
          type="bar" 
        />
      </div>

      {/* Detailed Marks */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {marks.length > 0 ? (
            <div className="space-y-6">
              {Array.from(new Set(marks.map(m => m.semester)))
                .sort((a, b) => b - a)
                .map(semester => (
                  <div key={semester}>
                    <h3 className="text-lg font-semibold mb-4">
                      Semester {semester}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {marks
                        .filter(mark => mark.semester === semester)
                        .map(mark => (
                          <Card key={mark.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{mark.subject.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {mark.subject.code}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    mark.marks >= 75 ? 'bg-success/10 text-success' :
                                    mark.marks >= 60 ? 'bg-warning/10 text-warning' :
                                    'bg-destructive/10 text-destructive'
                                  }`}>
                                    {mark.marks}%
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No marks available</h3>
              <p className="text-muted-foreground">
                Your academic records will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarks;