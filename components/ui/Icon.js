import {
  LayoutDashboard, GraduationCap, Users, Layers, CalendarCheck, IndianRupee, FileText, ClipboardList,
  Sparkles, MessageCircle, Mail, BarChart3, Bell, Wallet, UserX, BookOpen, FileBarChart, UserPlus,
  FilePlus, Megaphone, Search, Menu, Settings, LifeBuoy, X, Send, Eye, Pencil, Calendar, Download,
  SearchX, ChevronDown,
} from "lucide-react";

const ICONS = {
  LayoutDashboard, GraduationCap, Users, Layers, CalendarCheck, IndianRupee, FileText, ClipboardList,
  Sparkles, MessageCircle, Mail, BarChart3, Bell, Wallet, UserX, BookOpen, FileBarChart, UserPlus,
  FilePlus, Megaphone, Search, Menu, Settings, LifeBuoy, X, Send, Eye, Pencil, Calendar, Download,
  SearchX, ChevronDown,
};

export default function Icon({ name, size = 18, ...rest }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp size={size} aria-hidden="true" {...rest} />;
}
