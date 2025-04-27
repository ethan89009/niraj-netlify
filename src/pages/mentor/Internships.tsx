import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Briefcase, Download, Search } from 'lucide-react';
import { InternshipReport, Profile } from '../../types';
import { toast } from 'sonner';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';

const MentorInternships: React.FC = () => {
  const [reports, setReports] = useState<(InternshipReport & { student: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('internship_reports')
          .select(`
            *,
            student:student_id (
              id,
              first_name,
              last_name,
              email,
              semester
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setReports(data || []);
      } catch (error) {
        console.error('Error fetching internship reports:', error);
        toast.error('Failed to load internship reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDownload = async (report: InternshipReport) => {
    try {
      const { data, error } = await supabase.storage
        .from('internships')
        .download(report.file_path);
      
      if (error) throw error;
      
      // Create a URL for the file and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.file_path.split('/').pop() || 'report';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download report');
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${report.student.first_name} ${report.student.last_name}`.toLowerCase();
    
    return (
      report.title.toLowerCase().includes(searchLower) ||
      studentName.includes(searchLower)
    );
  });

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
        <h1 className="text-3xl font-bold tracking-tight">Internship Reports</h1>
        <p className="text-muted-foreground">
          View and manage internship reports submitted by your mentees.
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by title or student name..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
              fullWidth
            />
          </div>
          
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <div className="bg-secondary/10 p-2 rounded-full">
                        <Briefcase className="h-5 w-5 text-secondary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {report.student.first_name} {report.student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Semester {report.student.semester}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(report.created_at), 'PPP')}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleDownload(report)}
                        className="flex items-center text-sm text-secondary hover:text-secondary/80 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No reports found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No reports match your search criteria" 
                  : "No internship reports have been submitted yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorInternships;