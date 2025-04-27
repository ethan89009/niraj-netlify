import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LeaveApplication } from '../../types';
import { toast } from 'sonner';

const LeaveApplicationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('leave_applications')
          .select('*')
          .eq('student_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setLeaveApplications(data || []);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        toast.error('Failed to load leave applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveApplications();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('leave_applications')
        .insert({
          student_id: currentUser.id,
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
          approved: null,
        })
        .select();
      
      if (error) throw error;
      
      setLeaveApplications([...(data || []), ...leaveApplications]);
      setIsModalOpen(false);
      setFormData({ startDate: '', endDate: '', reason: '' });
      toast.success('Leave application submitted successfully');
    } catch (error) {
      console.error('Error submitting leave application:', error);
      toast.error('Failed to submit leave application');
    }
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === true) {
      return (
        <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </div>
      );
    } else if (status === false) {
      return (
        <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </div>
      );
    } else {
      return (
        <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </div>
      );
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
          <h1 className="text-3xl font-bold tracking-tight">Leave Applications</h1>
          <p className="text-muted-foreground">
            Apply for leave and view your leave application history.
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
        >
          Apply for Leave
        </Button>
      </div>
      
      {/* Leave Applications List */}
      <div className="grid gap-4">
        {leaveApplications.length > 0 ? (
          leaveApplications.map((leave) => (
            <Card key={leave.id} className="animate-slide-in">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Leave Application
                  </CardTitle>
                  {getStatusBadge(leave.approved)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {format(new Date(leave.start_date), 'PP')} - {format(new Date(leave.end_date), 'PP')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(leave.created_at), 'PP')}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Reason:</h3>
                    <p className="text-sm text-gray-700">{leave.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-lg font-medium">No leave applications yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any leave applications yet.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(true)}
              >
                Apply for Leave
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Leave Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Apply for Leave</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Leave
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplicationPage;