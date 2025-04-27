import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { UserRound, Mail, PhoneCall, Users } from 'lucide-react';
import { Profile } from '../types';

interface MentorCardProps {
  mentor: Profile;
  menteeCount?: number;
  onClick?: () => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  mentor, 
  menteeCount = 0,
  onClick
}) => {
  return (
    <Card 
      className={`overflow-hidden animate-slide-in transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="bg-secondary/5 pb-3">
        <CardTitle className="text-base">
          {mentor.first_name} {mentor.last_name}
        </CardTitle>
        <CardDescription className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {menteeCount} {menteeCount === 1 ? 'Mentee' : 'Mentees'} Assigned
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Faculty ID: {mentor.id.substring(0, 8)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{mentor.email}</span>
          </div>
          
          {mentor.phone && (
            <div className="flex items-center text-sm">
              <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{mentor.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorCard;