export const ABSENTEES = [
  { id: 1, student: "Rahul Sharma", cls: "12-A", reason: "Not informed", notified: "Sent" },
  { id: 2, student: "Rohit Yadav", cls: "11-B", reason: "Fever", notified: "Sent" },
  { id: 3, student: "Sneha Patel", cls: "10-A", reason: "Family function", notified: "Sent" },
  { id: 4, student: "Neha Gupta", cls: "9-C", reason: "Not informed", notified: "Pending" },
];
export const ASSIGNMENTS = [
  { id: 1, title: "Newton's Laws worksheet", cls: "12-A", subject: "Physics", due: "Oct 3", submitted: "34/42", status: "Open" },
  { id: 2, title: "Quadratic equations set 4", cls: "10-B", subject: "Mathematics", due: "Oct 2", submitted: "38/38", status: "Completed" },
  { id: 3, title: "Organic chemistry notes", cls: "11-A", subject: "Chemistry", due: "Oct 5", submitted: "12/35", status: "Open" },
  { id: 4, title: "Essay: My Role Model", cls: "9-C", subject: "English", due: "Oct 1", submitted: "31/40", status: "Overdue" },
  { id: 5, title: "Trigonometry practice", cls: "10-A", subject: "Mathematics", due: "Oct 6", submitted: "9/44", status: "Open" },
];
export const EXAMS = [
  { id: 1, exam: "Physics Unit Test", cls: "12-A", date: "Oct 4", room: "204", marks: 50 },
  { id: 2, exam: "Maths Mid-term", cls: "10-B", date: "Oct 7", room: "108", marks: 100 },
  { id: 3, exam: "Chemistry Quiz", cls: "11-A", date: "Oct 9", room: "Lab 2", marks: 25 },
  { id: 4, exam: "English Final", cls: "9-C", date: "Oct 12", room: "301", marks: 80 },
];
export const ANNOUNCEMENTS = [
  { id: 1, title: "Diwali holiday schedule", audience: "All parents", sent: "Yesterday" },
  { id: 2, title: "Class 12 mock test", audience: "Class 12", sent: "2 days ago" },
  { id: 3, title: "Fee due date reminder", audience: "Pending fees", sent: "3 days ago" },
];
export const PENDING_AI_ACTIONS = [
  { id: 1, text: "Send fee reminders to 32 parents", area: "Fees" },
  { id: 2, text: "Notify 6 parents of low attendance", area: "Attendance" },
  { id: 3, text: "Share weekly report for Class 10", area: "Reports" },
];
export const PARENT_CHATS = [
  { id: 1, parent: "Mr. Suresh Sharma", last: "Rahul's attendance — can he join tomorrow?", time: "2 min", status: "AI replied" },
  { id: 2, parent: "Mrs. Meena Singh", last: "Thanks for the progress report!", time: "18 min", status: "Read" },
  { id: 3, parent: "Mr. Ramesh Yadav", last: "Fee will be paid by Friday.", time: "1 hr", status: "Needs you" },
  { id: 4, parent: "Mrs. Sunita Gupta", last: "Is Saturday's class on?", time: "3 hrs", status: "AI replied" },
];
export const REPORT_TYPES = ["Student", "Attendance", "Fee Collection", "Performance", "Teacher", "Batch", "AI Automation"];
