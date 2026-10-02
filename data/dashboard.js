export const STATS = [
  { icon: "GraduationCap", label: "Total Students", value: "1,248", note: "+8.4% this month", up: true, trend: [4, 5, 5, 6, 7, 7, 9] },
  { icon: "CalendarCheck", label: "Today's Attendance", value: "92.5%", note: "+3.2% from yesterday", up: true, trend: [7, 6, 8, 7, 8, 9, 9] },
  { icon: "IndianRupee", label: "Pending Fees", value: "₹1,24,500", note: "68 students pending", up: false, trend: [9, 8, 8, 7, 7, 8, 6] },
  { icon: "Wallet", label: "Monthly Revenue", value: "₹8,45,000", note: "+12.6% this month", up: true, trend: [3, 4, 5, 5, 7, 8, 9] },
];

export const GROWTH = {
  "7 Days": { total: [1170, 1180, 1190, 1205, 1220, 1236, 1248], added: [6, 8, 9, 15, 15, 16, 12] },
  "30 Days": { total: [1120, 1150, 1180, 1205, 1230, 1248], added: [22, 30, 30, 25, 25, 18] },
  "6 Months": { total: [980, 1040, 1100, 1150, 1205, 1248], added: [60, 60, 60, 50, 55, 43] },
  "1 Year": { total: [700, 820, 930, 1010, 1100, 1248], added: [120, 120, 110, 80, 90, 148] },
};

export const ATTENDANCE_WEEK = [
  { label: "Mon", value: 91 }, { label: "Tue", value: 94 }, { label: "Wed", value: 89 },
  { label: "Thu", value: 93 }, { label: "Fri", value: 88 }, { label: "Sat", value: 95 },
];

export const CLASS_PERFORMANCE = [
  { name: "Class 9", marks: 68, attendance: 91, students: 312 },
  { name: "Class 10", marks: 74, attendance: 93, students: 340 },
  { name: "Class 11", marks: 71, attendance: 90, students: 296 },
  { name: "Class 12", marks: 79, attendance: 94, students: 300 },
];

export const AI_KPIS = [
  { value: 86, label: "Tasks today" }, { value: 142, label: "Messages sent" },
  { value: 37, label: "Parents notified" }, { value: 8, label: "Pending actions" },
];

export const AUTOMATIONS = [
  { id: "attendance", icon: "UserX", title: "Attendance Automation", text: "Notify parents when a student is absent", on: true },
  { id: "fees", icon: "IndianRupee", title: "Fee Reminder Automation", text: "Send reminders for pending fees", on: true },
  { id: "homework", icon: "BookOpen", title: "Homework Automation", text: "Send homework to students and parents", on: true },
  { id: "exams", icon: "ClipboardList", title: "Exam Reminder", text: "Notify students about upcoming exams", on: true },
  { id: "reports", icon: "FileBarChart", title: "Performance Reports", text: "AI-written student summaries", on: false },
  { id: "parents", icon: "MessageCircle", title: "Parent Communication", text: "AI-assisted WhatsApp replies", on: true },
];

export const ACTIVITY = [
  { icon: "UserX", text: "Rahul Sharma marked absent", time: "2 minutes ago" },
  { icon: "IndianRupee", text: "Fee payment received from Aman Verma", time: "15 minutes ago" },
  { icon: "Sparkles", text: "AI sent attendance notification to 24 parents", time: "32 minutes ago" },
  { icon: "UserPlus", text: "New student Priya Singh registered", time: "1 hour ago" },
  { icon: "FileText", text: "Class 12 Physics assignment published", time: "2 hours ago" },
];

export const TODAYS_CLASSES = [
  { subject: "Physics", teacher: "Mr. Rajesh Kumar", batch: "Class 12-A", room: "204", time: "10:00 – 11:00 AM", students: 42, status: "Live" },
  { subject: "Mathematics", teacher: "Ms. Anita Desai", batch: "Class 10-B", room: "108", time: "11:30 AM – 12:30 PM", students: 38, status: "Upcoming" },
  { subject: "Chemistry", teacher: "Dr. Sunil Mishra", batch: "Class 11-A", room: "Lab 2", time: "8:00 – 9:00 AM", students: 35, status: "Completed" },
  { subject: "English", teacher: "Ms. Kavita Rao", batch: "Class 9-C", room: "301", time: "2:00 – 3:00 PM", students: 40, status: "Upcoming" },
];

export const AI_MESSAGES = [
  { title: "Attendance Alert", text: "AI sent absence notification to 18 parents." },
  { title: "Fee Reminder", text: "AI sent pending-fee reminders to 32 parents." },
  { title: "Homework Update", text: "AI distributed today's homework to Class 10 students." },
  { title: "Exam Reminder", text: "AI reminded Class 12 students about the upcoming Physics exam." },
];

export const QUICK_ACTIONS = [
  { icon: "UserPlus", label: "Add Student" }, { icon: "Layers", label: "Create Batch" },
  { icon: "CalendarCheck", label: "Mark Attendance" }, { icon: "IndianRupee", label: "Collect Fee" },
  { icon: "FilePlus", label: "Create Assignment" }, { icon: "ClipboardList", label: "Schedule Exam" },
  { icon: "Megaphone", label: "Send Announcement" }, { icon: "Sparkles", label: "AI Automation", href: "/ai-automation" },
];

export const TOP_STUDENTS = [
  { name: "Priya Singh", cls: "10-B", marks: 96, attendance: 97 },
  { name: "Aman Verma", cls: "12-A", marks: 94, attendance: 94 },
  { name: "Ishita Jain", cls: "11-A", marks: 92, attendance: 98 },
];

export const SUBJECTS = [
  { name: "Mathematics", score: 76 }, { name: "Physics", score: 71 },
  { name: "Chemistry", score: 74 }, { name: "English", score: 82 },
];
