-- ============================================
-- Community-Driven Academic Archiving Platform
-- Database Schema for Supabase (PostgreSQL)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('guest', 'user', 'moderator', 'admin');
CREATE TYPE resource_category AS ENUM ('question_paper', 'notes', 'lab_manual', 'project_report');
CREATE TYPE exam_type AS ENUM ('mid_term', 'end_term', 'quiz', 'assignment', 'other');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    credits INTEGER CHECK (credits >= 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Resources table (main content table)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category resource_category NOT NULL,
    exam_type exam_type,
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    file_type TEXT NOT NULL,
    status submission_status DEFAULT 'pending' NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL CHECK (download_count >= 0),
    average_rating DECIMAL(2,1) DEFAULT 0 NOT NULL CHECK (average_rating >= 0 AND average_rating <= 5),
    rating_count INTEGER DEFAULT 0 NOT NULL CHECK (rating_count >= 0),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(resource_id, user_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, resource_id)
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_resources_course_id ON resources(course_id);
CREATE INDEX idx_resources_uploader_id ON resources(uploader_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_year ON resources(year);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_courses_department_id ON courses(department_id);
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_ratings_resource_id ON ratings(resource_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Full-text search index
CREATE INDEX idx_resources_fts ON resources USING gin(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM profiles WHERE id = user_id;
    RETURN COALESCE(user_role_value, 'guest'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0)
            FROM ratings
            WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for rating updates
CREATE TRIGGER on_rating_change
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_resource_rating();

-- Trigger for updated_at on resources
CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on ratings
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- Departments policies
CREATE POLICY "Departments are viewable by everyone"
    ON departments FOR SELECT
    USING (true);

CREATE POLICY "Only moderators and admins can insert departments"
    ON departments FOR INSERT
    WITH CHECK (get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Only moderators and admins can update departments"
    ON departments FOR UPDATE
    USING (get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Only admins can delete departments"
    ON departments FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- Courses policies
CREATE POLICY "Courses are viewable by everyone"
    ON courses FOR SELECT
    USING (true);

CREATE POLICY "Only moderators and admins can insert courses"
    ON courses FOR INSERT
    WITH CHECK (get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Only moderators and admins can update courses"
    ON courses FOR UPDATE
    USING (get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Only admins can delete courses"
    ON courses FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- Resources policies
CREATE POLICY "Approved resources are viewable by everyone"
    ON resources FOR SELECT
    USING (
        status = 'approved' 
        OR uploader_id = auth.uid() 
        OR get_user_role(auth.uid()) = 'moderator'
    );

CREATE POLICY "Authenticated users can insert resources"
    ON resources FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own pending resources"
    ON resources FOR UPDATE
    USING (
        (uploader_id = auth.uid() AND status = 'pending')
        OR get_user_role(auth.uid()) = 'moderator'
    );

CREATE POLICY "Users can delete own pending resources"
    ON resources FOR DELETE
    USING (
        (uploader_id = auth.uid() AND status = 'pending')
        OR get_user_role(auth.uid()) = 'moderator'
    );

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
    ON ratings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert ratings"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
    ON ratings FOR DELETE
    USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Activity log viewable by authenticated users"
    ON activity_log FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Activity log insertable by authenticated users"
    ON activity_log FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- SEED DATA
-- Manipur Technical University (MTU) B.Tech CSE Course Structure
-- ============================================

-- Insert departments
INSERT INTO departments (name, code, description) VALUES
('Computer Science and Engineering', 'CSE', 'Department of Computer Science and Engineering'),
('Electronics and Communication Engineering', 'ECE', 'Department of Electronics and Communication Engineering'),
('Electrical Engineering', 'EE', 'Department of Electrical Engineering'),
('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering'),
('Civil Engineering', 'CE', 'Department of Civil Engineering'),
('Mathematics', 'MA', 'Department of Mathematics'),
('Physics', 'PH', 'Department of Physics'),
('Chemistry', 'CH', 'Department of Chemistry'),
('Humanities and Social Sciences', 'HS', 'Department of Humanities and Social Sciences'),
('Management Studies', 'MG', 'Department of Management Studies'),
('Biology', 'BI', 'Department of Biology');

-- ============================================
-- SEMESTER I COURSES
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA1101', 'Linear Algebra', 1, 3, 'L-T-P: 2-1-0 | Course Type: SMC'),
((SELECT id FROM departments WHERE code = 'PH'), 'PH1101', 'Optics and Modern Physics', 1, 3, 'L-T-P: 3-0-0 | Course Type: SMC'),
((SELECT id FROM departments WHERE code = 'CH'), 'CH1101', 'Applied Chemistry', 1, 3, 'L-T-P: 3-0-0 | Course Type: SMC'),
((SELECT id FROM departments WHERE code = 'ME'), 'ME1103', 'Foundations of Mechanical Engineering', 1, 3, 'L-T-P: 3-0-0 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS1101', 'Programming for Problem Solving', 1, 4, 'L-T-P: 3-0-2 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS1101', 'Professional Communication', 1, 3, 'L-T-P: 2-1-0 | Course Type: HMC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS1102', 'Design Thinking', 1, 1, 'L-T-P: 0-0-2 | Course Type: HMC'),
((SELECT id FROM departments WHERE code = 'ECE'), 'EC1102', 'Electronics and Computer Workshop', 1, 1, 'L-T-P: 0-0-2 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'CH'), 'CH1102', 'Applied Chemistry Laboratory', 1, 1, 'L-T-P: 0-0-2 | Course Type: SMC'),
((SELECT id FROM departments WHERE code = 'PH'), 'PH1102', 'Optics and Modern Physics Laboratory', 1, 1, 'L-T-P: 0-0-2 | Course Type: SMC');

-- ============================================
-- SEMESTER II COURSES
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA1202', 'Univariate Calculus', 2, 3, 'L-T-P: 2-1-0 | Course Type: SMC'),
((SELECT id FROM departments WHERE code = 'PH'), 'PH1203', 'Semiconductor Physics and Electromagnetism', 2, 3, 'L-T-P: 3-0-0 | Course Type: SMC/AEC'),
((SELECT id FROM departments WHERE code = 'EE'), 'EE1201', 'Basic Electrical Engineering', 2, 3, 'L-T-P: 3-0-0 | Course Type: AEC/SMC'),
((SELECT id FROM departments WHERE code = 'ME'), 'ME1204', 'Engineering Graphics and Design', 2, 3, 'L-T-P: 1-0-4 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'CE'), 'CE1203', 'Engineering Mechanics', 2, 5, 'L-T-P: 3-1-2 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'ME'), 'ME1205', 'Mechanical Fab Shop', 2, 1, 'L-T-P: 0-0-3 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS1202', 'Introduction to Scientific Computational Tools', 2, 1, 'L-T-P: 0-0-2 | Course Type: AEC'),
((SELECT id FROM departments WHERE code = 'EE'), 'EE1202', 'Basic Electrical Engineering Laboratory', 2, 1, 'L-T-P: 0-0-2 | Course Type: AEC/SMC'),
((SELECT id FROM departments WHERE code = 'PH'), 'PH1204', 'Semiconductor Physics and Electromagnetism Laboratory', 2, 1, 'L-T-P: 0-0-2 | Course Type: AEC/SMC');

-- ============================================
-- SEMESTER III COURSES (Regular)
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA2301', 'Ordinary Differential Equations and Multivariate Calculus', 3, 3, 'L-T-P: 2-1-0 | Course Type: BSC'),
((SELECT id FROM departments WHERE code = 'MG'), 'MG2301', 'Professional Laws, Ethics, Values and Harmony', 3, 0, 'L-T-P: 1-0-0 | Course Type: MLC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS2303', 'Innovation and Creativity', 3, 1, 'L-T-P: 1-0-0 | Course Type: HSMC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2303', 'Development Tools Laboratory', 3, 2, 'L-T-P: 1-0-2 | Course Type: SBC'),
((SELECT id FROM departments WHERE code = 'EE'), 'EE2312', 'Feedback Control Systems', 3, 2, 'L-T-P: 1-1-0 | Course Type: IFC | Offered by EE'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2304', 'Data Structures and Algorithms – I', 3, 2, 'L-T-P: 2-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2305', 'Data Structures and Algorithms – I Laboratory', 3, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2306', 'Digital Logic Design', 3, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2307', 'Digital Logic Design Laboratory', 3, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2308', 'Discrete Structures and Graph Theory', 3, 3, 'L-T-P: 2-1-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2309', 'Principles of Programming Languages', 3, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2310', 'Principles of Programming Languages Laboratory', 3, 1, 'L-T-P: 0-0-2 | Course Type: LC');

-- ============================================
-- SEMESTER III COURSES (Lateral Entry Additional)
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA2302', 'Linear Algebra and Univariate Calculus', 3, 5, 'L-T-P: 4-1-0 | Course Type: BSC | Lateral Entry'),
((SELECT id FROM departments WHERE code = 'PH'), 'PH2301', 'Foundation of Physics', 3, 3, 'L-T-P: 3-0-0 | Course Type: BSC | Lateral Entry');

-- ============================================
-- SEMESTER IV COURSES (Regular)
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA2403', 'Vector Calculus and Partial Differential Equations', 4, 3, 'L-T-P: 2-1-0 | Course Type: BSC'),
((SELECT id FROM departments WHERE code = 'BI'), 'BI2401', 'Biology for Engineers', 4, 3, 'L-T-P: 3-0-0 | Course Type: BSC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2411', 'Rapid Prototyping Practice Using Object Oriented Programming', 4, 2, 'L-T-P: 1-0-2 | Course Type: SBC'),
((SELECT id FROM departments WHERE code = 'ECE'), 'EC2408', 'Sensors and Automation', 4, 2, 'L-T-P: 1-0-2 | Course Type: IFC | Offered by ECE'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2412', 'Theory of Computation', 4, 4, 'L-T-P: 3-1-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2413', 'Microprocessor Techniques', 4, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2414', 'Microprocessor Techniques Laboratory', 4, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2415', 'Data Structures and Algorithms – II', 4, 2, 'L-T-P: 2-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2416', 'Data Structures and Algorithms – II Laboratory', 4, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS2417', 'Data Communication', 4, 3, 'L-T-P: 3-0-0 | Course Type: PCC');

-- ============================================
-- SEMESTER IV COURSES (Lateral Entry Additional)
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA2404', 'Multivariate Calculus and Differential Equations', 4, 5, 'L-T-P: 4-1-0 | Course Type: BSC | Lateral Entry');

-- ============================================
-- SEMESTER V COURSES
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'MA'), 'MA3501', 'Probability and Statistics for Engineers', 5, 3, 'L-T-P: 2-1-0 | Course Type: BSC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS3505', 'Constitution of India', 5, 0, 'L-T-P: 1-0-0 | Course Type: MLC'),
((SELECT id FROM departments WHERE code = 'MG'), 'MG3502', 'Entrepreneurship Principles and Process', 5, 1, 'L-T-P: 1-0-0 | Course Type: HSMC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS3504', 'English Language Proficiency', 5, 2, 'L-T-P: 2-0-0 | Course Type: HSMC | Humanities Open Course I'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3520', 'Software Engineering: Mini Project – Stage 1', 5, 2, 'L-T-P: 0-1-2 | Course Type: SBC'),
((SELECT id FROM departments WHERE code = 'ME'), 'ME3509', 'Robotics', 5, 2, 'L-T-P: 2-0-0 | Course Type: IFC | Offered by ME'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3521', 'Computer Organization', 5, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3522', 'Database Management Systems', 5, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3523', 'Database Management Systems Laboratory', 5, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3524', 'Artificial Intelligence', 5, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3525', 'Artificial Intelligence Laboratory', 5, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3526', 'Computer Networks', 5, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3527', 'Computer Networks Laboratory', 5, 1, 'L-T-P: 0-0-2 | Course Type: LC');

-- ============================================
-- SEMESTER VI COURSES
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'CE'), 'CE3632', 'Environmental Studies', 6, 0, 'L-T-P: 1-0-0 | Course Type: MLC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS3606', 'Engineering Economics', 6, 2, 'L-T-P: 2-0-0 | Course Type: HSMC | Humanities Open Course II'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3634', 'Software Engineering: Mini Project – Stage II', 6, 3, 'L-T-P: 2-0-2 | Course Type: SBC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3635', 'Introduction to Artificial Intelligence (IOC)', 6, 2, 'L-T-P: 1-0-2 | Course Type: IOC | Interdisciplinary Open Course I'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3644', 'Computer Graphics', 6, 3, 'L-T-P: 3-0-0 | Course Type: DEC | Department Elective I'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3645', 'Computer Graphics Laboratory', 6, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3636', 'Operating Systems', 6, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3637', 'Operating Systems Laboratory', 6, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3638', 'Design and Analysis of Algorithms', 6, 4, 'L-T-P: 3-1-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3639', 'Data Science', 6, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS3640', 'Data Science Laboratory', 6, 1, 'L-T-P: 0-0-2 | Course Type: LC');

-- ============================================
-- SEMESTER VII COURSES
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'HS'), 'HS4712', 'Intellectual Property Rights', 7, 0, 'L-T-P: 1-0-0 | Course Type: MLC'),
((SELECT id FROM departments WHERE code = 'HS'), 'HS47XX', 'Liberal Learning Course', 7, 1, 'L-T-P: 1-0-0 | Course Type: LLC | Options: Stress Management, Photography, etc.'),
((SELECT id FROM departments WHERE code = 'MG'), 'MG4703', 'Business Management (IOC-II)', 7, 2, 'L-T-P: 2-0-0 | Course Type: IOC | Interdisciplinary Open Course II'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4746', 'Compiler Construction', 7, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4747', 'Compiler Construction Laboratory', 7, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4748', 'Cryptography and Network Security', 7, 3, 'L-T-P: 3-0-0 | Course Type: PCC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4749', 'Cryptography and Network Security Laboratory', 7, 1, 'L-T-P: 0-0-2 | Course Type: LC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4751', 'Cloud and Big Data', 7, 3, 'L-T-P: 3-0-0 | Course Type: DEC | Department Elective II'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4771', 'Natural Language Processing', 7, 3, 'L-T-P: 3-0-0 | Course Type: DEC | Department Elective III'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4772', 'Natural Language Processing Laboratory', 7, 1, 'L-T-P: 0-0-2 | Course Type: LC');

-- ============================================
-- SEMESTER VIII COURSES
-- ============================================
INSERT INTO courses (department_id, code, name, semester, credits, description) VALUES
((SELECT id FROM departments WHERE code = 'CSE'), 'DEC-IV', 'Departmental Elective IV', 8, 3, 'L-T-P: 3-0-0 | Course Type: DEC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'DEC-IV-LAB', 'Departmental Elective IV Laboratory', 8, 1, 'L-T-P: 0-0-2 | Course Type: DEC'),
((SELECT id FROM departments WHERE code = 'CSE'), 'CS4873', 'Project', 8, 8, 'L-T-P: 0-0-16 | Course Type: SBC | Final Year Project');

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Note: Run these in Supabase dashboard SQL editor
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', false);

-- Storage policies (run in Supabase dashboard)
-- CREATE POLICY "Authenticated users can upload files"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can view approved resource files"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'resources');

-- CREATE POLICY "Users can delete own files"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
