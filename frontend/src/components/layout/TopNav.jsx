import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, ArrowRight, Upload, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Logo from "../ui/Logo";

const LANGUAGES = ["English", "Hindi", "Spanish", "French"];

export default function TopNav() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [selectedLang, setSelectedLang] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const handleUpload = () => {
    if (user?.is_artist) {
      navigate("/dashboard");
    } else {
      navigate("/artist/create");
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-16 grid grid-cols-3 items-center px-8 bg-[#2C2C2C] border-b border-border sticky top-0 z-10 font-serif">
      {/* Left: Logo */}
      <div className="justify-self-start">
        <button onClick={() => navigate("/")} className="flex items-center">
          <Logo size={36} withMargin={false} />
        </button>
      </div>

      {/* Center: Home, Search, Upload — true page-center */}
      <div className="justify-self-center flex items-center gap-6">
        <button onClick={() => navigate("/")} className="text-white hover:text-accent transition shrink-0">
          <Home className="w-5 h-5" />
        </button>

        <div className="relative w-80">
          <Search className="w-4 h-4 text-white absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#757575] text-white placeholder-gray-200 rounded-full pl-10 pr-10 py-2.5 text-sm font-serif text-center outline-none focus:ring-2 focus:ring-accent transition"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 transition">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button onClick={handleUpload} className="text-white hover:text-accent transition shrink-0" title="Upload">
          <Upload className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Pro/Upgrade, Language, Avatar */}
      <div className="justify-self-end flex items-center gap-5">
        <button
          onClick={() => navigate("/plans")}
          className="font-serif text-sm text-gray-300 hover:text-accent transition hidden sm:inline"
        >
          {user?.tier === "T1" ? "Pro" : "Upgrade"}
        </button>

        {/* Language dropdown */}
        <div className="relative hidden sm:block" ref={langRef}>
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1 font-serif text-sm text-gray-300 hover:text-accent transition"
          >
            {selectedLang} <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-[#757575] border border-border rounded-md shadow-lg py-1 z-20">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm font-serif transition ${
                    lang === selectedLang ? "text-accent" : "text-white hover:text-accent"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="w-8 h-8 rounded-full bg-[#757575] flex items-center justify-center text-white hover:text-accent transition"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}