import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import AiAutomationCenter from "@/components/dashboard/AiAutomationCenter";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StudentGrowth from "@/components/dashboard/StudentGrowth";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import TodaysClasses from "@/components/dashboard/TodaysClasses";
import QuickActions from "@/components/dashboard/QuickActions";
import FeeOverview from "@/components/dashboard/FeeOverview";
import ClassPerformance from "@/components/dashboard/ClassPerformance";
import PerformanceSection from "@/components/dashboard/PerformanceSection";
import StudentsTable from "@/components/dashboard/StudentsTable";
import AiMessageCenter from "@/components/dashboard/AiMessageCenter";

export default function DashboardPage() {
  return (
    <>
      <WelcomeHeader />
      <StatsGrid />
      <div className="grid g2 mt"><AiAutomationCenter /><RecentActivity /></div>
      <div className="grid g2 mt"><StudentGrowth /><AttendanceOverview /></div>
      <div className="grid g2 mt"><TodaysClasses /><QuickActions /></div>
      <div className="grid g2 mt">
        <FeeOverview />
        <div className="stack"><ClassPerformance /><PerformanceSection /></div>
      </div>
      <div className="grid g2 mt"><StudentsTable limit={6} /><AiMessageCenter /></div>
    </>
  );
}
