import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Terminal, 
  HelpCircle, 
  Wifi, 
  Mail, 
  ArrowLeft,
  BookOpen
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const FAQ_DATA = [
  {
    id: "proctor-1",
    category: "Proctoring & Rules",
    icon: ShieldAlert,
    question: "What does the proctoring system track?",
    answer: "The proctoring system monitors events such as exiting fullscreen mode, switching tabs or browser windows, losing window focus, and copy/paste actions. These events are logged to maintain test integrity."
  },
  {
    id: "proctor-2",
    category: "Proctoring & Rules",
    icon: ShieldAlert,
    question: "What happens if I trigger a proctoring violation?",
    answer: "You will receive a warning alert on your screen. You are allowed a maximum of 5 violations. Exceeding this limit will cause your assessment session to be automatically locked and submitted as is."
  },
  {
    id: "proctor-3",
    category: "Proctoring & Rules",
    icon: ShieldAlert,
    question: "Why is fullscreen mode required?",
    answer: "Fullscreen mode is mandatory to ensure a fair testing environment. If you exit fullscreen mode, a blocking screen will appear. You must click 'Enter Fullscreen' to resume your assessment."
  },
  {
    id: "code-1",
    category: "Coding Workspace",
    icon: Terminal,
    question: "What programming languages are supported?",
    answer: "ValuHire supports Python 3, JavaScript (Node.js), Java, and C++. You can toggle your preferred language using the dropdown in the coding editor at any point."
  },
  {
    id: "code-2",
    category: "Coding Workspace",
    icon: Terminal,
    question: "How is my code executed and evaluated?",
    answer: "When you click 'Run Code', your solution is sent to a secure, isolated Docker container on our servers where it is compiled and executed. It is run against pre-configured test cases to evaluate correctness, speed, and output matching."
  },
  {
    id: "code-3",
    category: "Coding Workspace",
    icon: Terminal,
    question: "Can I use external libraries or packages?",
    answer: "Only standard built-in libraries for the chosen language are permitted. External packages (e.g., pandas in Python, lodash in JavaScript) are not installed or supported in the sandbox environment."
  },
  {
    id: "gen-1",
    category: "General & Submission",
    icon: HelpCircle,
    question: "Is my progress saved automatically?",
    answer: "Yes, your progress is saved dynamically. MCQ choices and code drafts are backed up on our servers in real time. If your browser closes or crashes, your work is preserved."
  },
  {
    id: "gen-2",
    category: "General & Submission",
    icon: HelpCircle,
    question: "What if my internet connection drops during the test?",
    answer: "Do not close the browser tab. The workspace will pause and notify you of a connection drop. Once your internet is restored, it will reconnect and sync automatically. Note that the overall session timer runs server-side and continues counting down even if you are offline."
  },
  {
    id: "gen-3",
    category: "General & Submission",
    icon: HelpCircle,
    question: "Can I go back to MCQs after moving to Coding?",
    answer: "No. Once you submit the MCQ section and proceed to the Coding section, the MCQ phase is permanently locked. Be sure to review all answers before clicking 'Submit MCQs'."
  }
];

const CATEGORIES = ["All", "Proctoring & Rules", "Coding Workspace", "General & Submission"];

export default function HelpPage() {
  const { user } = useAuth();
  const role = user?.role || "CANDIDATE";
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      
      <main className="workspace flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header Row */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-outline-variant/50 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-title-lg font-bold text-on-surface">Help & Support</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
              Candidate View
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8 pb-16">
          {/* Banner with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-indigo-500/10">
            <div className="relative z-10 max-w-lg">
              <span className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-2 block">Support Hub</span>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">How can we help you today?</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Find answers to common questions about your assessment, proctoring rules, code execution, and technical troubleshooting.
              </p>
            </div>
            {/* Abstract visual backgrounds */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="white" />
              </svg>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="space-y-4">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Search className="text-slate-400 ml-4 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search for questions, rules, compilation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pr-4 outline-none text-slate-800 placeholder-slate-400 bg-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 mr-2 text-xs font-semibold hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 px-1">
              {searchQuery ? `Search Results (${filteredFaqs.length})` : "Frequently Asked Questions"}
            </h3>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const Icon = faq.icon;
                  const isExpanded = expandedId === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`bg-white rounded-2xl border transition-all duration-200 ${
                        isExpanded 
                          ? "border-blue-200 ring-4 ring-blue-500/5 shadow-sm" 
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <button
                        onClick={() => toggleExpand(faq.id)}
                        className="w-full text-left p-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            isExpanded 
                              ? "bg-blue-50 text-blue-600" 
                              : "bg-slate-50 text-slate-500"
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-0.5 opacity-90">
                              {faq.category}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                              {faq.question}
                            </h4>
                          </div>
                        </div>
                        <div className={`text-slate-400 transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180 text-blue-600" : ""}`}>
                          <ChevronDown size={18} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-6 pt-1 border-t border-slate-100 animate-fade-in">
                          <p className="text-slate-600 text-sm md:text-base leading-relaxed pl-12">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-dashed border-slate-300">
                  <Search size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">No questions matched your search</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Try searching with different keywords, select a different category tab, or check the categories above.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                <Mail size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Still have questions?</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Contact our support team for help regarding technical issues or account inquiries.
                </p>
              </div>
            </div>
            <a 
              href="mailto:support@valuhire.com?subject=ValuHire%20Assessment%20Help"
              className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all inline-flex items-center gap-2 whitespace-nowrap"
            >
              Email support@valuhire.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
