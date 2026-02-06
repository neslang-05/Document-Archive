-- ============================================
-- Seed Data for D1
-- Migrated from Supabase schema.sql
-- IDs are generated as deterministic UUIDs for reproducibility
-- ============================================

-- Insert departments
INSERT OR IGNORE INTO departments (id, name, code, description) VALUES
('d0000001-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science and Engineering'),
('d0000001-0000-0000-0000-000000000002', 'Electronics and Communication Engineering', 'ECE', 'Department of Electronics and Communication Engineering'),
('d0000001-0000-0000-0000-000000000003', 'Electrical Engineering', 'EE', 'Department of Electrical Engineering'),
('d0000001-0000-0000-0000-000000000004', 'Mechanical Engineering', 'ME', 'Department of Mechanical Engineering'),
('d0000001-0000-0000-0000-000000000005', 'Civil Engineering', 'CE', 'Department of Civil Engineering'),
('d0000001-0000-0000-0000-000000000006', 'Mathematics', 'MA', 'Department of Mathematics'),
('d0000001-0000-0000-0000-000000000007', 'Physics', 'PH', 'Department of Physics'),
('d0000001-0000-0000-0000-000000000008', 'Chemistry', 'CH', 'Department of Chemistry'),
('d0000001-0000-0000-0000-000000000009', 'Humanities and Social Sciences', 'HS', 'Department of Humanities and Social Sciences'),
('d0000001-0000-0000-0000-000000000010', 'Management Studies', 'MG', 'Department of Management Studies'),
('d0000001-0000-0000-0000-000000000011', 'Biology', 'BI', 'Department of Biology');

-- ============================================
-- SEMESTER I COURSES
-- ============================================
INSERT OR IGNORE INTO courses (id, department_id, code, name, semester, credits, description) VALUES
('c0000001-0000-0000-0001-000000000001', 'd0000001-0000-0000-0000-000000000006', 'MA1101', 'Linear Algebra', 1, 3, 'L-T-P: 2-1-0 | Course Type: SMC'),
('c0000001-0000-0000-0001-000000000002', 'd0000001-0000-0000-0000-000000000007', 'PH1101', 'Optics and Modern Physics', 1, 3, 'L-T-P: 3-0-0 | Course Type: SMC'),
('c0000001-0000-0000-0001-000000000003', 'd0000001-0000-0000-0000-000000000008', 'CH1101', 'Applied Chemistry', 1, 3, 'L-T-P: 3-0-0 | Course Type: SMC'),
('c0000001-0000-0000-0001-000000000004', 'd0000001-0000-0000-0000-000000000004', 'ME1103', 'Foundations of Mechanical Engineering', 1, 3, 'L-T-P: 3-0-0 | Course Type: AEC'),
('c0000001-0000-0000-0001-000000000005', 'd0000001-0000-0000-0000-000000000001', 'CS1101', 'Programming for Problem Solving', 1, 4, 'L-T-P: 3-0-2 | Course Type: AEC'),
('c0000001-0000-0000-0001-000000000006', 'd0000001-0000-0000-0000-000000000009', 'HS1101', 'Professional Communication', 1, 3, 'L-T-P: 2-1-0 | Course Type: HMC'),
('c0000001-0000-0000-0001-000000000007', 'd0000001-0000-0000-0000-000000000009', 'HS1102', 'Design Thinking', 1, 1, 'L-T-P: 0-0-2 | Course Type: HMC'),
('c0000001-0000-0000-0001-000000000008', 'd0000001-0000-0000-0000-000000000002', 'EC1102', 'Electronics and Computer Workshop', 1, 1, 'L-T-P: 0-0-2 | Course Type: AEC'),
('c0000001-0000-0000-0001-000000000009', 'd0000001-0000-0000-0000-000000000008', 'CH1102', 'Applied Chemistry Laboratory', 1, 1, 'L-T-P: 0-0-2 | Course Type: SMC'),
('c0000001-0000-0000-0001-000000000010', 'd0000001-0000-0000-0000-000000000007', 'PH1102', 'Optics and Modern Physics Laboratory', 1, 1, 'L-T-P: 0-0-2 | Course Type: SMC');

-- ============================================
-- SEMESTER II COURSES
-- ============================================
INSERT OR IGNORE INTO courses (id, department_id, code, name, semester, credits, description) VALUES
('c0000001-0000-0000-0002-000000000001', 'd0000001-0000-0000-0000-000000000006', 'MA1202', 'Univariate Calculus', 2, 3, 'L-T-P: 2-1-0 | Course Type: SMC'),
('c0000001-0000-0000-0002-000000000002', 'd0000001-0000-0000-0000-000000000007', 'PH1203', 'Semiconductor Physics and Electromagnetism', 2, 3, 'L-T-P: 3-0-0 | Course Type: SMC/AEC'),
('c0000001-0000-0000-0002-000000000003', 'd0000001-0000-0000-0000-000000000003', 'EE1201', 'Basic Electrical Engineering', 2, 3, 'L-T-P: 3-0-0 | Course Type: AEC/SMC'),
('c0000001-0000-0000-0002-000000000004', 'd0000001-0000-0000-0000-000000000004', 'ME1204', 'Engineering Graphics and Design', 2, 3, 'L-T-P: 1-0-4 | Course Type: AEC'),
('c0000001-0000-0000-0002-000000000005', 'd0000001-0000-0000-0000-000000000005', 'CE1203', 'Engineering Mechanics', 2, 5, 'L-T-P: 3-1-2 | Course Type: AEC'),
('c0000001-0000-0000-0002-000000000006', 'd0000001-0000-0000-0000-000000000004', 'ME1205', 'Mechanical Fab Shop', 2, 1, 'L-T-P: 0-0-3 | Course Type: AEC'),
('c0000001-0000-0000-0002-000000000007', 'd0000001-0000-0000-0000-000000000001', 'CS1202', 'Introduction to Scientific Computational Tools', 2, 1, 'L-T-P: 0-0-2 | Course Type: AEC'),
('c0000001-0000-0000-0002-000000000008', 'd0000001-0000-0000-0000-000000000003', 'EE1202', 'Basic Electrical Engineering Laboratory', 2, 1, 'L-T-P: 0-0-2 | Course Type: AEC/SMC'),
('c0000001-0000-0000-0002-000000000009', 'd0000001-0000-0000-0000-000000000007', 'PH1204', 'Semiconductor Physics and Electromagnetism Laboratory', 2, 1, 'L-T-P: 0-0-2 | Course Type: AEC/SMC');

-- Note: Additional semesters (III-VIII) follow the same pattern.
-- The full seed data can be generated from the original supabase/schema.sql
-- by transforming the INSERT statements to use deterministic TEXT IDs
-- and removing the subquery-based department_id lookups.
