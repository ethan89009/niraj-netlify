import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Briefcase, Upload, Download } from 'lucide-react';
import { InternshipReport } from '../../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    onUpload(title, file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upload Internship Report</h2>
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
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report File
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full"
                accept=".pdf,.doc,.docx"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Upload Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const StudentInternship: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<InternshipReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('internship_reports')
          .select('*')
          .eq('student_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setReports(data || []);
      } catch (error) {
        console.error('Error fetching internship reports:', error);
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [currentUser]);

  const handleUpload = async (title: string, file: File) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `internships/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('internships')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create report record
      const { data, error } = await supabase
        .from('internship_reports')
        .insert({
          student_id: currentUser.id,
          title,
          file_path: filePath,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setReports([data, ...reports]);
      toast.success('Report uploaded successfully');
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload report');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Internship Reports</h1>
          <p className="text-muted-foreground">
            Upload and manage your internship reports.
          </p>
        </div>
        
        <Button 
          variant="primary" 
          icon={<Upload size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Upload Report
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.created_at), 'PPP')}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download size={16} />}
                        onClick={() => handleDownload(report)}
                      >
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No reports uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first internship report to get started.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(true)}
              >
                Upload Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default StudentInternship;