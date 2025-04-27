import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { UserRound, Mail, PhoneCall, Calendar, BadgeAlert } from 'lucide-react';
import Badge from './ui/Badge';
import { Profile } from '../types';

interface StudentCardProps {
  student: Profile;
  hasBlocklogs?: boolean;
  onClick?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  hasBlocklogs = false,
  onClick
}) => {
  return (
    <Card 
      className={`overflow-hidden animate-slide-in transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="bg-gray-50 pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">
            {student.first_name} {student.last_name}
          </span>
          {hasBlocklogs && (
            <Badge variant="destructive" className="ml-auto">
              <BadgeAlert className="h-3 w-3 mr-1" />
              Blocklogs
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Student ID: {student.id.substring(0, 8)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{student.email}</span>
          </div>
          
          {student.phone && (
            <div className="flex items-center text-sm">
              <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{student.phone}</span>
            </div>
          )}
          
          {student.semester && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Semester {student.semester}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;