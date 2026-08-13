export type Role = "student" | "admin" | "warden";

export const roleMeta: Record<Role, { label: string; tagline: string; home: string }> = {
  student: { label: "Student Panel", tagline: "Your hostel life, organised", home: "/student" },
  admin: { label: "Admin Panel", tagline: "Run the whole hostel operation", home: "/admin" },
  warden: { label: "Warden Panel", tagline: "Day-to-day student oversight", home: "/warden" },
};

export const currentStudent = {
  name: "Aarav Sharma",
  rollNo: "HMS2024/CS/118",
  course: "B.Tech Computer Science — Year 3",
  roomNo: "B-204",
  block: "B Block",
  floor: "2nd Floor",
  email: "aarav.sharma@campus.edu",
  phone: "+91 98200 41176",
  guardianName: "Rakesh Sharma",
  guardianPhone: "+91 98200 55210",
  dateOfJoining: "12 Jul 2024",
  status: "Active",
};

export const roommates = [
  { name: "Vikram Iyer", rollNo: "HMS2024/ME/091", course: "B.Tech Mechanical", phone: "+91 90045 12003" },
  { name: "Daniel Okoye", rollNo: "HMS2024/CS/144", course: "B.Tech Computer Science", phone: "+91 90128 88410" },
];

export type Fee = {
  id: string;
  student: string;
  rollNo: string;
  semester: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  method?: string;
};

export const fees: Fee[] = [
  { id: "FEE-1041", student: "Aarav Sharma", rollNo: "HMS2024/CS/118", semester: "Sem 5 · Hostel", amount: 48000, paid: 48000, dueDate: "10 Jul 2026", status: "Paid", method: "UPI" },
  { id: "FEE-1042", student: "Aarav Sharma", rollNo: "HMS2024/CS/118", semester: "Sem 5 · Mess", amount: 21000, paid: 12000, dueDate: "05 Sep 2026", status: "Pending", method: "Card" },
  { id: "FEE-1043", student: "Vikram Iyer", rollNo: "HMS2024/ME/091", semester: "Sem 5 · Hostel", amount: 48000, paid: 48000, dueDate: "10 Jul 2026", status: "Paid", method: "Net Banking" },
  { id: "FEE-1044", student: "Meera Nair", rollNo: "HMS2024/EC/032", semester: "Sem 3 · Hostel", amount: 48000, paid: 0, dueDate: "18 Jun 2026", status: "Overdue" },
  { id: "FEE-1045", student: "Daniel Okoye", rollNo: "HMS2024/CS/144", semester: "Sem 5 · Mess", amount: 21000, paid: 21000, dueDate: "05 Aug 2026", status: "Paid", method: "UPI" },
  { id: "FEE-1046", student: "Sara Qureshi", rollNo: "HMS2025/BT/007", semester: "Sem 1 · Hostel", amount: 46000, paid: 20000, dueDate: "28 Aug 2026", status: "Pending", method: "UPI" },
  { id: "FEE-1047", student: "Rohit Verma", rollNo: "HMS2023/CE/210", semester: "Sem 7 · Hostel", amount: 48000, paid: 0, dueDate: "02 Jun 2026", status: "Overdue" },
];

export type Student = {
  id: string;
  name: string;
  rollNo: string;
  course: string;
  roomNo: string;
  year: string;
  status: "Active" | "Inactive";
  phone: string;
};

export const students: Student[] = [
  { id: "S-118", name: "Aarav Sharma", rollNo: "HMS2024/CS/118", course: "Computer Science", roomNo: "B-204", year: "Year 3", status: "Active", phone: "+91 98200 41176" },
  { id: "S-091", name: "Vikram Iyer", rollNo: "HMS2024/ME/091", course: "Mechanical", roomNo: "B-204", year: "Year 3", status: "Active", phone: "+91 90045 12003" },
  { id: "S-144", name: "Daniel Okoye", rollNo: "HMS2024/CS/144", course: "Computer Science", roomNo: "B-204", year: "Year 3", status: "Active", phone: "+91 90128 88410" },
  { id: "S-032", name: "Meera Nair", rollNo: "HMS2024/EC/032", course: "Electronics", roomNo: "A-112", year: "Year 2", status: "Active", phone: "+91 99881 20034" },
  { id: "S-007", name: "Sara Qureshi", rollNo: "HMS2025/BT/007", course: "Biotechnology", roomNo: "A-118", year: "Year 1", status: "Active", phone: "+91 91234 55008" },
  { id: "S-210", name: "Rohit Verma", rollNo: "HMS2023/CE/210", course: "Civil", roomNo: "C-301", year: "Year 4", status: "Inactive", phone: "+91 90987 71120" },
  { id: "S-155", name: "Ananya Ghosh", rollNo: "HMS2024/CS/155", course: "Computer Science", roomNo: "A-120", year: "Year 3", status: "Active", phone: "+91 90011 44521" },
  { id: "S-063", name: "Imran Khan", rollNo: "HMS2025/ME/063", course: "Mechanical", roomNo: "C-208", year: "Year 1", status: "Active", phone: "+91 93322 10098" },
];

export type Room = {
  roomNo: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  status: "Available" | "Full" | "Maintenance";
};

export const rooms: Room[] = [
  { roomNo: "A-112", block: "A Block", floor: "1st", capacity: 3, occupied: 2, status: "Available" },
  { roomNo: "A-118", block: "A Block", floor: "1st", capacity: 3, occupied: 3, status: "Full" },
  { roomNo: "A-120", block: "A Block", floor: "1st", capacity: 2, occupied: 1, status: "Available" },
  { roomNo: "B-204", block: "B Block", floor: "2nd", capacity: 3, occupied: 3, status: "Full" },
  { roomNo: "B-210", block: "B Block", floor: "2nd", capacity: 3, occupied: 0, status: "Maintenance" },
  { roomNo: "C-208", block: "C Block", floor: "2nd", capacity: 4, occupied: 2, status: "Available" },
  { roomNo: "C-301", block: "C Block", floor: "3rd", capacity: 4, occupied: 4, status: "Full" },
];

export type Complaint = {
  id: string;
  student: string;
  roomNo: string;
  category: "Water" | "Electricity" | "Mess" | "WiFi" | "Furniture" | "Other";
  description: string;
  status: "Pending" | "In Progress" | "Resolved";
  raisedAt: string;
};

export const complaints: Complaint[] = [
  { id: "CMP-3120", student: "Aarav Sharma", roomNo: "B-204", category: "WiFi", description: "Wi-Fi drops every evening between 8-10 PM on 2nd floor.", status: "In Progress", raisedAt: "09 Aug 2026" },
  { id: "CMP-3118", student: "Aarav Sharma", roomNo: "B-204", category: "Water", description: "Hot water not available in the morning shift.", status: "Resolved", raisedAt: "27 Jul 2026" },
  { id: "CMP-3126", student: "Meera Nair", roomNo: "A-112", category: "Electricity", description: "Tube light flickering, socket near study desk is dead.", status: "Pending", raisedAt: "11 Aug 2026" },
  { id: "CMP-3129", student: "Sara Qureshi", roomNo: "A-118", category: "Mess", description: "Dinner served cold on weekends.", status: "Pending", raisedAt: "12 Aug 2026" },
  { id: "CMP-3111", student: "Imran Khan", roomNo: "C-208", category: "Furniture", description: "Cupboard hinge broken.", status: "Resolved", raisedAt: "18 Jul 2026" },
  { id: "CMP-3131", student: "Ananya Ghosh", roomNo: "A-120", category: "Other", description: "Corridor light sensor stays off after 11 PM.", status: "In Progress", raisedAt: "13 Aug 2026" },
];

export type Outpass = {
  id: string;
  student: string;
  rollNo: string;
  reason: string;
  departure: string;
  expectedReturn: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const outpasses: Outpass[] = [
  { id: "OP-882", student: "Aarav Sharma", rollNo: "HMS2024/CS/118", reason: "Family function at home", departure: "16 Aug 2026, 09:00 AM", expectedReturn: "17 Aug 2026, 08:00 PM", status: "Pending" },
  { id: "OP-879", student: "Aarav Sharma", rollNo: "HMS2024/CS/118", reason: "Dentist appointment", departure: "02 Aug 2026, 04:00 PM", expectedReturn: "02 Aug 2026, 09:00 PM", status: "Approved" },
  { id: "OP-884", student: "Meera Nair", rollNo: "HMS2024/EC/032", reason: "Inter-college hackathon", departure: "15 Aug 2026, 06:30 AM", expectedReturn: "15 Aug 2026, 11:00 PM", status: "Pending" },
  { id: "OP-871", student: "Rohit Verma", rollNo: "HMS2023/CE/210", reason: "Weekend trip", departure: "25 Jul 2026, 07:00 AM", expectedReturn: "27 Jul 2026, 09:00 PM", status: "Rejected" },
  { id: "OP-886", student: "Imran Khan", rollNo: "HMS2025/ME/063", reason: "Bank work in city", departure: "14 Aug 2026, 10:00 AM", expectedReturn: "14 Aug 2026, 05:00 PM", status: "Approved" },
];

export type Leave = {
  id: string;
  student: string;
  from: string;
  to: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const leaves: Leave[] = [
  { id: "LV-411", student: "Aarav Sharma", from: "20 Aug 2026", to: "24 Aug 2026", reason: "Cousin's wedding in Pune", status: "Pending" },
  { id: "LV-404", student: "Aarav Sharma", from: "01 Jul 2026", to: "06 Jul 2026", reason: "Semester break travel", status: "Approved" },
  { id: "LV-415", student: "Ananya Ghosh", from: "18 Aug 2026", to: "19 Aug 2026", reason: "Medical checkup", status: "Pending" },
  { id: "LV-398", student: "Rohit Verma", from: "10 Jun 2026", to: "20 Jun 2026", reason: "Internship relocation", status: "Rejected" },
  { id: "LV-417", student: "Sara Qureshi", from: "21 Aug 2026", to: "23 Aug 2026", reason: "Family event", status: "Approved" },
];

export type AttendanceRow = {
  date: string;
  student: string;
  roomNo: string;
  status: "Present" | "Absent" | "Leave";
  markedBy: string;
};

export const attendance: AttendanceRow[] = [
  { date: "13 Aug 2026", student: "Aarav Sharma", roomNo: "B-204", status: "Present", markedBy: "Warden Desai" },
  { date: "13 Aug 2026", student: "Meera Nair", roomNo: "A-112", status: "Present", markedBy: "Warden Desai" },
  { date: "13 Aug 2026", student: "Sara Qureshi", roomNo: "A-118", status: "Leave", markedBy: "Warden Desai" },
  { date: "13 Aug 2026", student: "Imran Khan", roomNo: "C-208", status: "Absent", markedBy: "Warden Desai" },
  { date: "12 Aug 2026", student: "Aarav Sharma", roomNo: "B-204", status: "Present", markedBy: "Warden Desai" },
  { date: "12 Aug 2026", student: "Ananya Ghosh", roomNo: "A-120", status: "Present", markedBy: "Warden Desai" },
  { date: "11 Aug 2026", student: "Aarav Sharma", roomNo: "B-204", status: "Leave", markedBy: "Admin Office" },
  { date: "11 Aug 2026", student: "Vikram Iyer", roomNo: "B-204", status: "Present", markedBy: "Admin Office" },
];

export const attendanceTrend = [
  { day: "Mon", present: 232, absent: 18 },
  { day: "Tue", present: 240, absent: 10 },
  { day: "Wed", present: 228, absent: 22 },
  { day: "Thu", present: 236, absent: 14 },
  { day: "Fri", present: 221, absent: 29 },
  { day: "Sat", present: 198, absent: 52 },
  { day: "Sun", present: 205, absent: 45 },
];

export type Meal = { day: string; breakfast: string; lunch: string; snacks: string; dinner: string };

export const messTimetable: Meal[] = [
  { day: "Monday", breakfast: "Poha, boiled eggs, tea", lunch: "Rajma chawal, salad", snacks: "Samosa, coffee", dinner: "Roti, paneer butter masala" },
  { day: "Tuesday", breakfast: "Idli, sambar, chutney", lunch: "Veg pulao, raita", snacks: "Banana cake, tea", dinner: "Roti, chicken curry" },
  { day: "Wednesday", breakfast: "Aloo paratha, curd", lunch: "Dal tadka, jeera rice", snacks: "Bhel puri, juice", dinner: "Fried rice, manchurian" },
  { day: "Thursday", breakfast: "Upma, fruit bowl", lunch: "Chole, bhature", snacks: "Pakora, tea", dinner: "Roti, egg curry" },
  { day: "Friday", breakfast: "Dosa, coconut chutney", lunch: "Sambar rice, papad", snacks: "Veg sandwich, coffee", dinner: "Roti, mixed veg, kheer" },
  { day: "Saturday", breakfast: "Puri bhaji, tea", lunch: "Biryani, mirchi ka salan", snacks: "Pasta, lemonade", dinner: "Roti, dal fry, halwa" },
  { day: "Sunday", breakfast: "Pancakes, milk", lunch: "Special thali", snacks: "Ice cream", dinner: "Noodles, spring rolls" },
];

export const mealTimings = [
  { meal: "Breakfast", time: "07:30 AM – 09:30 AM" },
  { meal: "Lunch", time: "12:30 PM – 02:30 PM" },
  { meal: "Snacks", time: "05:00 PM – 06:00 PM" },
  { meal: "Dinner", time: "08:00 PM – 10:00 PM" },
];

export type Notice = { id: string; title: string; body: string; audience: string; postedAt: string; pinned?: boolean };

export const notices: Notice[] = [
  { id: "N-51", title: "Water supply maintenance", body: "Block B water supply will be closed on 16 Aug from 10 AM to 2 PM for tank cleaning.", audience: "All residents", postedAt: "12 Aug 2026", pinned: true },
  { id: "N-50", title: "Independence Day assembly", body: "Flag hoisting at 08:00 AM in the main quad. Attendance is mandatory for all residents.", audience: "All residents", postedAt: "11 Aug 2026" },
  { id: "N-49", title: "Mess fee deadline extended", body: "Sem 5 mess fee due date moved to 05 Sep 2026. Late fee applies after that.", audience: "Students", postedAt: "08 Aug 2026" },
  { id: "N-48", title: "Night attendance timing", body: "Room attendance will now be marked at 10:30 PM sharp on weekdays.", audience: "Students & Wardens", postedAt: "04 Aug 2026" },
];

export const feeCollection = { collectedPct: 75, collected: 2841000, target: 3788000 };

export const monthlyCollection = [
  { month: "Mar", amount: 420 },
  { month: "Apr", amount: 510 },
  { month: "May", amount: 380 },
  { month: "Jun", amount: 620 },
  { month: "Jul", amount: 740 },
  { month: "Aug", amount: 571 },
];

export const complaintsByCategory = [
  { name: "Water", value: 14 },
  { name: "Electricity", value: 11 },
  { name: "Mess", value: 9 },
  { name: "WiFi", value: 17 },
  { name: "Furniture", value: 6 },
];

export const inr = (n: number) => "\u20b9" + n.toLocaleString("en-IN");
