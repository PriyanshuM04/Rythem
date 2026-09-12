import { useNavigate, useLocation } from "react-router-dom";
import {
  HelpCircle,
  Settings,
  Sparkles,
  TrendingUp,
  Mic2,
  Users,
  Radio,
  History,
  Heart,
  ListMusic,
  ListVideo,
  Music,
} from "lucide-react";

const browseLinks = [
  { label: "New Releases", path: "/new-releases", icon: Sparkles },
  { label: "Top Charts", path: "/top-charts", icon: TrendingUp },
  { label: "Podcasts", path: "/podcasts", icon: Mic2 },
  { label: "Top Artists", path: "/top-artists", icon: Users },
  { label: "Radio", path: "/radio", icon: Radio },
];

const libraryLinks = [
  { label: "History", path: "/history", icon: History },
  { label: "Liked Songs", path: "/liked-songs", icon: Heart },
  { label: "Queue", path: "/queue", icon: ListVideo },
  { label: "Playlists", path: "/playlists", icon: ListMusic },
  { label: "Artists", path: "/artists", icon: Music },
];

function NavSection({ title, links }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="mb-6">
      <h3 className="font-serif text-base text-white mb-3">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <li key={link.path}>
              <button
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-2.5 font-serif text-sm transition text-left w-full ${
                  isActive ? "text-accent" : "text-gray-300 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-56 shrink-0 bg-[#2C2C2C] flex flex-col justify-between p-5 border-r border-border sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div>
        <NavSection title="Browse" links={browseLinks} />
        <NavSection title="Library" links={libraryLinks} />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/help")}
          className="flex items-center gap-2.5 font-serif text-sm text-gray-300 hover:text-white transition"
        >
          <HelpCircle className="w-4 h-4 shrink-0" /> Help
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2.5 font-serif text-sm text-gray-300 hover:text-white transition"
        >
          <Settings className="w-4 h-4 shrink-0" /> Settings
        </button>
      </div>
    </aside>
  );
}