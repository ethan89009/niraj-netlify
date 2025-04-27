// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
  profile?: Profile;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  role: 'admin' | 'mentor' | 'student';
  mentor_id?: string;
  semester?: number;
  year_of_admission?: number;
}

// Academic Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
}

export interface Marks {
  id: string;
  student_id: string;
  subject_id: string;
  type: 'internal' | 'semester';
  marks: number;
  semester: number;
  subject?: Subject;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  present: boolean;
  subject?: Subject;
}

// Mentoring Types
export interface MentoringSession {
  id: string;
  mentor_id: string;
  student_id: string;
  title: string;
  date: string;
  notes?: string;
}

export interface InternshipReport {
  id: string;
  student_id: string;
  title: string;
  file_path: string;
  created_at: string;
}

export interface LeaveApplication {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  approved: boolean | null;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  created_by: string;
  file_path?: string;
  created_at: string;
}