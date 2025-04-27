import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { FileText, Download } from 'lucide-react';
import { Notice } from '../types';
import Button from './ui/Button';

interface NoticeCardProps {
  notice: Notice;
  showActions?: boolean;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, showActions = true }) => {
  const handleDownload = async () => {
    if (notice.file_path) {
      try {
        const { data, error } = await supabase.storage
          .from('notices')
          .download(notice.file_path);
          
        if (error) throw error;
        
        // Create a URL for the file and trigger download
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = notice.file_path.split('/').pop() || 'notice';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md animate-slide-in">
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{notice.title}</CardTitle>
            <CardDescription>
              {format(new Date(notice.created_at), 'PPP')}
            </CardDescription>
          </div>
          {notice.file_path && (
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
          {notice.content}
        </p>
        
        {showActions && notice.file_path && (
          <Button 
            variant="outline" 
            size="sm"
            icon={<Download size={16} />}
            onClick={handleDownload}
            className="mt-2"
          >
            Download Attachment
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NoticeCard;