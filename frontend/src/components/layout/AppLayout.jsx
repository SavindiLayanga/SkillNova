import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import Chatbot from "../ui/Chatbot.jsx";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="admin-premium-wallpaper min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onChatClick={() => {
          setIsSidebarOpen(false);
          setIsChatOpen(true);
        }}
      />
      <div className="min-w-0 lg:pl-[290px]">
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onChatClick={() => setIsChatOpen(true)} 
        />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-20 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
      
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
