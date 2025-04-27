import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import NoticeCard from '../../components/NoticeCard';
import { Plus, Bell } from 'lucide-react';
import { Notice } from '../../types';
import { toast } from 'sonner';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  onSave: (notice: Notice) => void;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, notice, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null as File | null,
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        file: null,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        file: null,
      });
    }
  }, [notice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let filePath = '';
    
    if (formData.file) {
      try {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const path = `notices/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('notices')
          .upload(path, formData.file);
        
        if (uploadError) throw uploadError;
        
        filePath = path;
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
        return;
      }
    }
    
    onSave({
      ...notice,
      title: formData.title,
      content: formData.content,
      file_path: filePath || notice?.file_path,
    } as Notice);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {notice ? 'Edit Notice' : 'Create New Notice'}
            </h2>
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
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachment (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {notice ? 'Update Notice' : 'Publish Notice'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setNotices(data || []);
      } catch (error) {
        console.error('Error fetching notices:', error);
        toast.error('Failed to load notices');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotices();
  }, []);

  const openAddModal = () => {
    setSelectedNotice(null);
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const handleSaveNotice = async (noticeData: Notice) => {
    try {
      if (noticeData.id) {
        // Update existing notice
        const { error } = await supabase
          .from('notices')
          .update({
            title: noticeData.title,
            content: noticeData.content,
            file_path: noticeData.file_path,
          })
          .eq('id', noticeData.id);
        
        if (error) throw error;
        
        setNotices(notices.map(n => n.id === noticeData.id ? noticeData : n));
        toast.success('Notice updated successfully');
      } else {
        // Create new notice
        const { data, error } = await supabase
          .from('notices')
          .insert({
            title: noticeData.title,
            content: noticeData.content,
            file_path: noticeData.file_path,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select();
        
        if (error) throw error;
        
        if (data) {
          setNotices([...data, ...notices]);
        }
        
        toast.success('Notice published successfully');
      }
    } catch (error) {
      console.error('Error saving notice:', error);
      toast.error('Failed to save notice');
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
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">
            Publish and manage notices for students and faculty.
          </p>
        </div>
        
        <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
          Create Notice
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {notices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {notices.map(notice => (
                <div 
                  key={notice.id}
                  onClick={() => openEditModal(notice)}
                  className="cursor-pointer"
                >
                  <NoticeCard notice={notice} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No notices yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first notice to keep everyone informed.
              </p>
              <Button 
                variant="outline" 
                onClick={openAddModal}
              >
                Create Notice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notice={selectedNotice}
        onSave={handleSaveNotice}
      />
    </div>
  );
};

export default AdminNotices;