/*
  # Initial schema setup

  1. User Profiles
    - `profiles` table for all users (admin, mentor, student)

  2. Academic Records
    - `subjects` table to store subject information
    - `marks` table to store student marks
    - `attendance` table to track student attendance

  3. Mentoring System
    - `mentoring_sessions` for scheduling and tracking mentoring sessions
    - `leave_applications` for student leave requests
    - `internship_reports` for BE student internship reporting
    - `notices` for admin announcements

  4. Security
    - Row level security for all tables
    - Policies to ensure proper data access control
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  phone text,
  role text NOT NULL CHECK (role IN ('admin', 'mentor', 'student')),
  mentor_id uuid REFERENCES profiles(id),
  semester integer CHECK (semester BETWEEN 1 AND 8),
  year_of_admission integer,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id),
  type text NOT NULL CHECK (type IN ('internal', 'semester')),
  marks numeric NOT NULL CHECK (marks >= 0 AND marks <= 100),
  semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id),
  total_days integer NOT NULL,
  present_days integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS mentoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  date timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  approved boolean,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS internship_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  file_path text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subjects policies - viewable by all authenticated users
CREATE POLICY "Subjects are viewable by all authenticated users"
  ON subjects FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify subjects"
  ON subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Marks policies
CREATE POLICY "Students can view their own marks"
  ON marks FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR
        (profiles.role = 'mentor' AND profiles.id = (
          SELECT mentor_id FROM profiles WHERE profiles.id = marks.student_id
        ))
      )
    )
  );

CREATE POLICY "Only admins can insert/update marks"
  ON marks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Attendance policies (similar to marks)
CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR
        (profiles.role = 'mentor' AND profiles.id = (
          SELECT mentor_id FROM profiles WHERE profiles.id = attendance.student_id
        ))
      )
    )
  );

CREATE POLICY "Only admins can insert/update attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Mentoring sessions policies
CREATE POLICY "Mentors can view/manage their own sessions"
  ON mentoring_sessions FOR ALL
  USING (
    auth.uid() = mentor_id OR
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Leave applications policies
CREATE POLICY "Students can view/create their own leave applications"
  ON leave_applications FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR
        (p.role = 'mentor' AND p.id = (
          SELECT mentor_id FROM profiles WHERE profiles.id = leave_applications.student_id
        ))
      )
    )
  );

CREATE POLICY "Students can insert their own leave applications"
  ON leave_applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Internship reports policies
CREATE POLICY "Students can view/manage their own internship reports"
  ON internship_reports FOR ALL
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR
        (p.role = 'mentor' AND p.id = (
          SELECT mentor_id FROM profiles WHERE profiles.id = internship_reports.student_id
        ))
      )
    )
  );

-- Notices policies
CREATE POLICY "Notices are viewable by all authenticated users"
  ON notices FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create notices"
  ON notices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update notices"
  ON notices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create admin function
CREATE OR REPLACE FUNCTION create_admin_user(
  email TEXT,
  password TEXT,
  first_name TEXT,
  last_name TEXT
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (email, password, email_confirmed_at)
  VALUES (email, password, now())
  RETURNING id INTO user_id;
  
  -- Create the profile
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (user_id, email, first_name, last_name, 'admin');
  
  RETURN user_id;
END;
$$;