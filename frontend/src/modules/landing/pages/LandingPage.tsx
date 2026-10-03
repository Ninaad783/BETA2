import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Database, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Plus, 
  Calendar,
  Menu,
  X,
  ArrowUp,
  Star
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { Modal } from '../../../components/ui/Modal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useUIStore();

  // Navigation & Interactive states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'billing' | 'fefo' | 'udhaar' | 'reports'>('billing');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Interactive Live POS Demo Simulator state
  const [doloQty, setDoloQty] = useState(2);
  const [pantoQty, setPantoQty] = useState(1);

  // Demo form states
  const [chemistName, setChemistName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('Khed Shivapur / Pune');

  // Floating Back to Top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  const isMr = language === 'mr';

  // Simulator live calculations
  const doloPrice = 32.0;
  const pantoPrice = 105.0;
  const simSubtotal = doloQty * doloPrice + pantoQty * pantoPrice;
  const simGst = Number((simSubtotal * 0.12).toFixed(2));
  const simGrandTotal = Number((simSubtotal + simGst).toFixed(2));

  const faqs = [
    {
      q: isMr ? 'मेडीइझी माझ्या बारकोड स्कॅनर आणि ८०mm थर्मल प्रिंटरसोबत चालेल का?' : 'Does MedEasy work with standard barcode scanners and 80mm thermal printers?',
      a: isMr
        ? 'होय, १००%! मेडीइझी कोणत्याही प्लग-अँड-प्ले USB किंवा ब्लूटूथ बारकोड स्कॅनर आणि ८०mm (३-इंच) थर्मल रोल प्रिंटरसोबत थेट काम करते. कोणत्याही ड्रायव्हरची कटकट नाही.'
        : 'Yes, 100%! MedEasy seamlessly connects with all standard plug-and-play USB/Bluetooth barcode scanners and 80mm (3-inch) thermal receipt printers with zero driver installation hurdles.'
    },
    {
      q: isMr ? 'FEFO पद्धत म्हणजे काय आणि त्याने एक्सपायरीचे नुकसान कसे थांबते?' : 'What is FEFO and how does it prevent medicine expiry write-offs?',
      a: isMr
        ? 'FEFO म्हणजे First-Expiry-First-Out (आधी एक्सपायर होणारी बॅच आधी विका). काउंटरवर औषध निवडताच सॉफ्टवेअर ज्या बॅचची एक्सपायरी जवळ आहे ती बॅच आपोआप पुढे आणते. यामुळे दुकानात औषधे पडून राहून होणारे नुकसान पूर्णपणे टळते.'
        : 'FEFO stands for First-Expiry-First-Out. When billing, MedEasy automatically locks and serves the batch closest to its expiry date first. Your staff never accidentally sells fresh batches while older inventory expires on back shelves.'
    },
    {
      q: isMr ? 'व्हॉट्सॲपवर उधारीचे स्मरणपत्र पाठवण्यासाठी अतिरिक्त शुल्क लागते का?' : 'Are there extra API fees for sending WhatsApp bills and Udhaar reminders?',
      a: isMr
        ? 'नाही! कोणतेही अतिरिक्त शुल्क नाही. मेडीइझी डायरेक्ट व्हॉट्सॲप वेब इंटिग्रेशन वापरते, ज्यामुळे तुमच्या स्वतःच्या फोन किंवा कॉम्प्युटरवरून एका क्लिकमध्ये ग्राहकाला संपूर्ण बिलाचा मेसेज आणि नम्र स्मरणपत्र मोफत पाठवता येते.'
        : 'No extra API fees! MedEasy uses direct WhatsApp dispatch, allowing you to send itemized e-bills and polite payment reminders directly to customer phones with a single click at zero extra cost.'
    },
    {
      q: isMr ? 'आमचे दुकानातील मदतनीस आणि मुलं हे मराठीत वापरू शकतात का?' : 'Can counter assistants and staff operate the software in Marathi?',
      a: isMr
        ? 'होय! मेडीइझी संपूर्णपणे मराठी आणि इंग्रजी दोन्ही भाषांमध्ये उपलब्ध आहे. उजव्या कोपऱ्यातील एका बटनाने संपूर्ण सॉफ्टवेअर मराठीत बदलते, जेणेकरून ग्रामीण व निमशहरी भागातील मदतनीस आत्मविश्वासाने जलद बिलिंग करू शकतात.'
        : 'Absolutely! MedEasy provides complete native bilingual support (English + Marathi). A single toggle switches the entire UI into Marathi so local shop staff can bill confidently without language barriers.'
    },
    {
      q: isMr ? 'माझा कॉम्प्युटर खराब झाला किंवा हार्ड डिस्क बंद पडली तर डेटा सुरक्षित राहील का?' : 'What happens if my counter computer crashes or hard drive fails?',
      a: isMr
        ? 'मेडीइझीमध्ये ऑटोमॅटिक डेली बॅकअप आणि एका क्लिकमध्ये संपूर्ण डेटाचा .sql डंप डाउनलोड करण्याची सोय (Feature 17) आहे. त्यामुळे तुमचा उधारी आणि स्टॉक डेटा १००% सुरक्षित राहतो आणि नवीन कॉम्प्युटरवर ५ मिनिटांत रिस्टोअर होतो.'
        : 'MedEasy includes automatic daily backup verification and one-click .sql database dump downloads (Feature 17), ensuring your billing records, customer Khata, and stock batches are 100% safe and restorable within 5 minutes.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white scroll-smooth relative">
      {/* =========================================================================
          1. STICKY TOP NAVBAR (WITH MOBILE MENU)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={scrollToTop}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">MedEasy</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider hidden sm:inline-block">
                  v1.0 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Smart Pharmacy OS • Khed Shivapur
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition">
              {isMr ? 'वैशिष्ट्ये' : 'What We Provide'}
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition">
              {isMr ? 'कसे चालते?' : 'How It Works'}
            </a>
            <a href="#comparison" className="hover:text-emerald-600 transition">
              {isMr ? 'तुलना' : 'Why MedEasy'}
            </a>
            <a href="#testimonials" className="hover:text-emerald-600 transition">
              {isMr ? 'केमिस्ट अनुभव' : 'Chemist Reviews'}
            </a>
            <a href="#pricing" className="hover:text-emerald-600 transition">
              {isMr ? 'दरपत्रक' : 'Pricing'}
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition">
              FAQ
            </a>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Bilingual Switcher */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  language === 'mr'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Login Link */}
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              {isMr ? 'लॉगिन' : 'Staff Login'}
            </button>

            {/* Launch App Primary CTA */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition cursor-pointer"
            >
              <span className="hidden sm:inline">{isMr ? 'लाइव्ह काउंटर' : 'Launch Live POS'}</span>
              <span className="sm:hidden">App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2.5 text-xs font-bold text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-50 transition"
              >
                {isMr ? '१. सर्वसमावेशक सुविधा' : '1. What We Provide'}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-50 transition"
              >
                {isMr ? '२. कसे चालते? (४ पायऱ्या)' : '2. How It Works (4 Steps)'}
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-50 transition"
              >
                {isMr ? '३. जुन्या सॉफ्टवेअरशी तुलना' : '3. Why MedEasy vs Legacy'}
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-50 transition"
              >
                {isMr ? '४. केमिस्ट अनुभव व पुनरावलोकन' : '4. Chemist Testimonials'}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-50 transition"
              >
                {isMr ? '५. दरपत्रक व प्लॅन्स' : '5. Transparent Pricing'}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-50 transition"
              >
                {isMr ? '६. वारंवार विचारले जाणारे प्रश्न' : '6. FAQ'}
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                {isMr ? 'काउंटर स्टाफ लॉगिन' : 'Staff Login'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-xs transition"
              >
                {isMr ? 'थेट काउंटर उघडा (Live Demo)' : 'Open Counter POS (Live Demo)'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 sm:pb-20 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-200/40 via-sky-200/30 to-teal-100/40 blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isMr
                ? 'महाराष्ट्रातील रिटेल केमिस्ट्ससाठी खास तयार केलेले स्मार्ट बिलिंग'
                : 'Engineered specifically for busy retail chemists in Maharashtra & India'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">100% FEFO Safe</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            {isMr ? (
              <>
                १० सेकंदात बिलिंग, शून्य एक्सपायरीचे नुकसान आणि{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  स्मार्ट उधारी व्हॉट्सॲप खातं.
                </span>
              </>
            ) : (
              <>
                Superfast Pharmacy POS with{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  10-Second Billing
                </span>
                , Zero Expiry Waste & WhatsApp Khata.
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {isMr
              ? 'मेडीइझी तुमच्या दुकानातील गर्दीच्या वेळी बिलिंग अतिशय जलद करते, आपोआप जुन्या बॅचेस आधी विकून एक्सपायरीचे नुकसान थांबवते आणि ग्राहकांना एका क्लिकवर व्हॉट्सॲपवर उधारी आठवण मेसेज पाठवते.'
              : 'Cut counter rush queues with auto-batch FEFO selection, print 80mm thermal receipts, send paperless WhatsApp e-bills, and recover customer Udhaar dues with a single click in Marathi and English.'}
          </p>

          {/* Hero CTAs */}
          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isMr ? 'लाइव्ह काउंटर डेमो पहा' : 'Try Live Pharmacy Counter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{isMr ? '१४ दिवसांचा मोफत डेमो मिळवा' : 'Book a 14-Day Free Trial'}</span>
            </button>
          </div>

          {/* Quick Trust Highlights */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> 10-Second Fast Billing
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Automatic FEFO Batch
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> 1-Click WhatsApp Khata
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> 80mm Thermal Print
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> मराठी व इंग्रजी
            </span>
          </div>

          {/* =========================================================================
              INTERACTIVE DEMO SCREEN PREVIEW (LIVE SIMULATOR)
              ========================================================================= */}
          <div className="mt-10 sm:mt-12 max-w-5xl mx-auto bg-white rounded-3xl border border-slate-300/80 shadow-2xl overflow-hidden text-left">
            {/* Simulated Window Chrome */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400">
                  medeasy.local/counter-pos • Khed Shivapur
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Counter 01 Online
                </span>
              </div>
            </div>

            {/* Interactive Feature Switcher Bar */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'billing'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. POS Live Billing Simulator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fefo')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'fefo'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>2. Auto FEFO Expiry Radar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('udhaar')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'udhaar'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>3. Udhaar Khata + WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'reports'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>4. Daily Net Profit Analytics</span>
              </button>
            </div>

            {/* Tab Preview Content */}
            <div className="p-4 sm:p-6 bg-slate-50/70 min-h-[360px] flex flex-col justify-center">
              {activeTab === 'billing' && (
                <div className="space-y-3.5">
                  <div className="text-xs text-slate-500 font-medium flex items-center justify-between pb-1 border-b border-slate-200">
                    <span>⚡ Try clicking quantity steppers (- / +) below:</span>
                    <span className="text-emerald-700 font-bold">Interactive POS Mode</span>
                  </div>

                  {/* Dolo 650 row */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                        #1
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Dolo 650 Tablets (Strip of 15)</h4>
                        <p className="text-xs text-slate-500">Paracetamol 650mg • Batch: D1234 (Exp: 08/2027)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setDoloQty(Math.max(1, doloQty - 1))}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 bg-white py-1">
                          {doloQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDoloQty(doloQty + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          FEFO Active Batch
                        </span>
                        <p className="text-sm font-black text-slate-900 mt-0.5">
                          ₹{(doloQty * doloPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pantoprazole 40 row */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0">
                        #2
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Pantoprazole 40mg</h4>
                        <p className="text-xs text-slate-500">Antacid / PPI • Batch: P4567 (Exp: 01/2027)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setPantoQty(Math.max(1, pantoQty - 1))}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 bg-white py-1">
                          {pantoQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPantoQty(pantoQty + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          Rack: A-02
                        </span>
                        <p className="text-sm font-black text-slate-900 mt-0.5">
                          ₹{(pantoQty * pantoPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary bar */}
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-emerald-400 font-medium">
                        Total Amount (Subtotal ₹{simSubtotal.toFixed(2)} + GST 12% ₹{simGst.toFixed(2)})
                      </span>
                      <p className="text-2xl font-black text-white">₹{simGrandTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate('/billing')} 
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                      >
                        Try Real Billing POS Screen →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fefo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <span className="text-xs font-bold text-amber-900 block">
                      ⚠️ Automatic Expiry Priority (First-Expiry-First-Out)
                    </span>
                    <p className="text-xs text-amber-800 mt-1">
                      MedEasy automatically locks the oldest batch for dispatch. Your counter staff never accidentally sells a fresh batch while old batches expire in the drawer.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-xs">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        DISPATCHING FIRST
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">Batch #AZ-2024</h4>
                      <p className="text-xs text-rose-600 font-semibold mt-0.5">Expiring: June 2026 (4 mos)</p>
                      <p className="text-xs text-slate-500 mt-1">Qty on hand: 18 strips</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 opacity-70">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                        QUEUED FOR LATER
                      </span>
                      <h4 className="text-sm font-bold text-slate-700 mt-2">Batch #AZ-2025</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Expiring: December 2027 (22 mos)</p>
                      <p className="text-xs text-slate-400 mt-1">Qty on hand: 100 strips</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate('/stock')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View Full Inventory Catalog & Batches →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'udhaar' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ramesh Kadam (Village Farmer)</h4>
                      <p className="text-xs text-slate-500">+91 98221 12233 • Last visit: 3 days ago</p>
                    </div>
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                        Due: ₹1,450
                      </span>
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            "Namaskar Rameshji,\nMedEasy Khed Shivapur कडून विनंती: आपले ₹1,450 उधारी बाकी आहे. कृपया सोयीनुसार भेट द्या किंवा UPI वर जमा करा."
                          );
                          window.open(`https://wa.me/919822112233?text=${text}`, '_blank');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send WhatsApp Reminder</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-mono">
                    "Namaskar Rameshji, MedEasy Khed Shivapur कडून विनंती: आपले ₹1,450 उधारी बाकी आहे. कृपया सोयीनुसार भेट द्या किंवा UPI वर जमा करा."
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate('/customers')}
                      className="text-xs font-bold text-sky-700 hover:underline"
                    >
                      Open Full Customer Udhaar Ledger →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Today's Sales</span>
                      <p className="text-xl font-black text-slate-900 mt-0.5">₹24,850</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-emerald-600 uppercase font-semibold">Net Profit (20.8%)</span>
                      <p className="text-xl font-black text-emerald-600 mt-0.5">₹5,180</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-sky-600 uppercase font-semibold">Bills Cleared</span>
                      <p className="text-xl font-black text-sky-700 mt-0.5">82 Bills</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                    <span>GSTR-1 Inward & Outward reconciliation ready for CA in 1 click.</span>
                    <button onClick={() => navigate('/reports')} className="text-sky-600 font-bold hover:underline cursor-pointer">
                      View Reports Dashboard →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. "WHAT WE PROVIDE" (FEATURE GRID) with scroll-mt-24
          ========================================================================= */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isMr ? 'सर्वसमावेशक सुविधा' : 'Complete Pharmacy Operating System'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              {isMr ? 'मेडीइझी तुमच्या दुकानासाठी काय पुरवते?' : 'Everything Your Medical Store Needs to Flourish'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-3">
              {isMr
                ? 'औषध विक्री, बॅच एक्स्पायरी, ग्राहक उधारी आणि जीएसटी हिशोब या सर्व गोष्टींसाठी एकाच जागी संपूर्ण सोय.'
                : 'Designed hand-in-hand with retail chemists in Maharashtra to replace slow, outdated desktop software.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {/* 1. Fast Billing */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMr ? '१० सेकंदात जलद बिलिंग' : '10-Second Fast Billing (POS)'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'कीबोर्ड शॉर्टकट्स आणि बारकोड स्कॅनिंगने गोळ्या शोधा आणि त्वरित बिल बनवा. गर्दीच्या वेळी ग्राहकांची लाईन लागणार नाही.'
                  : 'Instant keyboard-first search by brand or salt name. Press Enter to add top match, adjust qty with -/+ steppers, and finish bill in seconds.'}
              </p>
            </div>

            {/* 2. FEFO Expiry Protection */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-rose-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMr ? 'FEFO स्मार्ट एक्सपायरी सुरक्षा' : 'Smart FEFO Batch Engine'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'ज्या औषधांची तारीख आधी संपत आहे ती बॅच आपोआप पुढे येते. दुकानात गोळ्या पडून राहून होणारे हजारो रुपयांचे नुकसान वाचवा.'
                  : 'First-Expiry-First-Out automatically serves the batch closest to expiry. Protect your pharmacy margins from unsellable expired inventory.'}
              </p>
            </div>

            {/* 3. Udhaar Khata & WhatsApp */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMr ? 'उधारी डिजिटल खातं + व्हॉट्सॲप' : 'Digital Udhaar Khata & WhatsApp'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'गावातील नियमित ग्राहकांची उधारी स्वतंत्र चोपडीत नोंदवण्याची गरज नाही. एका क्लिकवर व्हॉट्सॲपवर नम्र मेसेज पाठवा.'
                  : 'Track customer credit ledger digitally. Dispatch pre-formatted, polite WhatsApp payment reminders with one click to collect dues on time.'}
              </p>
            </div>

            {/* 4. 80mm Thermal & WhatsApp Bill */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMr ? '८०mm थर्मल स्लिप व ई-बिल' : '80mm Thermal Print & WhatsApp Slip'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'छोट्या थर्मल प्रिंटरवर तात्काळ पावती छापा, किंवा ग्राहकाला व्हॉट्सॲपवर कागदविरहित ई-बिल पाठवून कागदाचा खर्च वाचवा.'
                  : 'Support for fast 3-inch 80mm thermal receipt roll printers with doctor name, DL number, GSTIN, and instant paperless WhatsApp sharing.'}
              </p>
            </div>

            {/* 5. Daily Profit & Analytics */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMr ? 'दैनिक नफा आणि विक्री अहवाल' : 'Real-Time Net Profit & Analytics'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'आज किती रुपयांची विक्री झाली आणि किती नफा झाला हे संध्याकाळी दुकान बंद करताना एका दृष्टीक्षेपात पहा.'
                  : 'Track gross daily revenue, exact net profit margins (~20.8%), invoice counts, and fast-moving medicines with sleek interactive charts.'}
              </p>
            </div>

            {/* 6. Disaster Recovery & Safety */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMr ? 'स्थानिक बॅकअप व सुरक्षा' : 'Disaster Recovery & Local Backup'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'रोजचा ऑटोमॅटिक बॅकअप आणि एका क्लिकमध्ये संपूर्ण डेटाचा .sql डंप तुमच्या कॉम्प्युटरवर सुरक्षित डाउनलोड करा.'
                  : 'Automatic daily cloud backup sync plus one-click local .sql dump download ensures your pharmacy data is 100% immune to hardware loss.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. "HOW IT WORKS" (4-STEP WORKFLOW) with scroll-mt-24
          ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isMr ? 'सुलभ कार्यपद्धती' : 'Fast Counter Workflow'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              {isMr ? 'काउंटरवर १० सेकंदात विक्री कशी होते?' : 'How a Pharmacy Sale Happens in 10 Seconds'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-3">
              {isMr
                ? 'कोणत्याही किचकट पायऱ्यांशिवाय थेट आणि गतिमान बिलिंग.'
                : 'Zero friction. Keyboard-first operations designed to breeze through peak evening crowds.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'शोध किंवा बारकोड स्कॅन' : 'Search or Scan Barcode'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'गोळीचे नाव टाईप करून थेट Enter दाबा किंवा बारकोड स्कॅन करा. औषध त्वरित बिलात समाविष्ट होते.'
                  : 'Type brand name or generic salt and hit Enter. Barcode scanner instantly adds the medicine without mouse clicks.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'आपोआप FEFO बॅच निवड' : 'Auto FEFO Batch Pick'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'सॉफ्टवेअर सर्वात आधी एक्सपायर होणारी बॅच आपोआप निवडते आणि रॅक नंबर (उदा. Rack A-01) दाखवते.'
                  : 'MedEasy automatically assigns the earliest expiry batch and displays shelf/rack coordinates for quick retrieval.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'पेमेंट मोड निवडा' : 'Select Tender Mode'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? 'रोख, UPI QR कोड, कार्ड किंवा थेट ग्राहक उधारी (Udhaar) खात्यात १ क्लिकमध्ये बिलाची नोंद करा.'
                  : 'Instant tender via Cash, UPI dynamic QR, Card, or tag to customer Udhaar credit ledger in one click.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'प्रिंट व व्हॉट्सॲप बिल' : 'Print & WhatsApp Bill'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isMr
                  ? '८०mm थर्मल प्रिंटरवरून पावती बाहेर येते आणि ग्राहकाच्या व्हॉट्सॲपवर डिजिटल ई-बिल लगेच जाते.'
                  : 'Instant 80mm thermal slip prints while an itemized WhatsApp e-bill is dispatched straight to the patient.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMPARISON: OLD SOFTWARE VS MEDEASY with scroll-mt-24
          ========================================================================= */}
      <section id="comparison" className="py-20 bg-white border-t border-slate-200/80 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isMr ? 'जुन्या सॉफ्टवेअरपेक्षा मेडीइझी का श्रेष्ठ?' : 'Why Pharmacists Are Switching to MedEasy'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              {isMr
                ? 'जुन्या Windows 98 शैलीतील क्लिष्ट सॉफ्टवेअरला निरोप द्या.'
                : 'Say goodbye to 90s DOS-style screens, printer jams, and complicated setups.'}
            </p>
          </div>

          <div className="mt-12 overflow-x-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4 sm:p-5">{isMr ? 'वैशिष्ट्ये' : 'Feature'}</th>
                  <th className="p-4 sm:p-5 text-slate-500">{isMr ? 'जुने पारंपारिक सॉफ्टवेअर' : 'Legacy Medical Software'}</th>
                  <th className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/70 border-x border-emerald-200">
                    {isMr ? 'मेडीइझी फार्मसी OS' : 'MedEasy Pharmacy OS'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{isMr ? 'बिलिंग गती' : 'Billing Speed'}</td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    {isMr ? 'हळूवार (प्रति ग्राहक ४५-६० सेकंद)' : 'Slow (45-60 seconds per customer)'}
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-200">
                    {isMr ? '⚡ अवघ्या १० सेकंदात (फास्ट कीबोर्ड POS)' : '⚡ 10 Seconds Flat (Instant Keyboard POS)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{isMr ? 'बॅच आणि एक्सपायरी नियंत्रण' : 'Batch Expiry Handling'}</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    {isMr ? 'मॅन्युअल निवड (औषध एक्स्पायर होण्याचा मोठा धोका)' : 'Manual selection (high risk of expiry loss)'}
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-200">
                    {isMr ? '🎯 ऑटो FEFO (पहिली एक्सपायरी आधी विक्री)' : '🎯 Auto FEFO (Earliest expiry served first)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{isMr ? 'ग्राहक उधारी खाते' : 'Customer Udhaar Ledger'}</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    {isMr ? 'जुनी कागदी डायरी नोंद' : 'Manual paper red-diary khata'}
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-200">
                    {isMr ? '📱 डिजिटल खाते + १-क्लिक व्हॉट्सॲप तगादा' : '📱 Digital Ledger + 1-Click WhatsApp Reminder'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{isMr ? 'भाषा पर्याय' : 'Language Support'}</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    {isMr ? 'फक्त इंग्रजी' : 'English only'}
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-200">
                    {isMr ? '🌐 १००% द्विभाषिक (मराठी + इंग्रजी)' : '🌐 100% Bilingual (मराठी + English)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{isMr ? 'थर्मल पावती प्रिंटिंग' : 'Thermal Slip Printing'}</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    {isMr ? 'महागडे डॉट-मॅट्रिक्स रिबन प्रिंटर' : 'Requires expensive dot-matrix ribbons'}
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-200">
                    {isMr ? '🖨️ जलद ८०mm USB/ब्लूटूथ पावती' : '🖨️ Universal 80mm USB/Bluetooth Thermal Slip'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{isMr ? 'डेटा सुरक्षा आणि बॅकअप' : 'Crash Protection'}</td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    {isMr ? 'हार्ड ड्राईव्ह खराब झाल्यास डेटा नष्ट' : 'Data lost if PC hard drive crashes'}
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-200">
                    {isMr ? '🛡️ ऑटो क्लाउड सिंक + १-क्लिक बॅकअप' : '🛡️ Auto Daily Cloud Sync + 1-Click .SQL Dump'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CHEMIST REVIEWS / TESTIMONIALS with scroll-mt-24
          ========================================================================= */}
      <section id="testimonials" className="py-20 bg-slate-50 border-t border-slate-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isMr ? 'केमिस्ट अनुभव' : 'Trusted by Pharmacists'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              {isMr ? 'महाराष्ट्रातील केमिस्ट काय म्हणतात?' : 'Loved by Medical Stores in Maharashtra'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              {isMr
                ? 'खेड शिवापूर, सातारा आणि पुण्यातील औषध विक्रेत्यांचे प्रत्यक्ष अनुभव.'
                : 'Real pharmacists sharing their operational turnaround after switching to MedEasy.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {/* Review 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{isMr
                    ? 'संध्याकाळी ५ ते ८ दरम्यान काउंटरवर खूप गर्दी असते. आधी एका बिलाला २-३ मिनिटे लागायची. मेडीइझीमुळे आता अवघ्या १० सेकंदात बिल निघतं आणि थेट व्हॉट्सॲपवर पोहोचतं!'
                    : 'During evening counter rush, lines used to back up outside the door. With MedEasy, bills take 10 seconds flat and customers love getting paperless WhatsApp receipts!'}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rahul Shinde</h4>
                  <p className="text-[11px] text-slate-500">Sai Samarth Medical, Khed Shivapur</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{isMr
                    ? 'उधारीचे पैसे वेळेत न येणे ही आमची सर्वात मोठी डोकेदुखी होती. मेडीइझीच्या १-क्लिक व्हॉट्सॲप रिमाइंडरने पहिल्याच महिन्यात अडकलेले ₹४२,००० जमा झाले!'
                    : 'Uncollected customer Udhaar was hurting our cashflow. MedEasy\'s 1-click WhatsApp reminder helped us collect ₹42,000 in overdue accounts in our very first month!'}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                  VP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Vikas Patil</h4>
                  <p className="text-[11px] text-slate-500">Patil Pharma & Wellness, Satara</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{isMr
                    ? 'FEFO सिस्टीममुळे दुकानाच्या मागच्या रॅकमध्ये गोळ्या पडून एक्सपायर होणे थांबले. दर तीन महिन्याला आमचे किमान ₹२०,००० वाया जाण्यापासून वाचत आहेत.'
                    : 'The FEFO batch prioritization completely stopped expired medicines from sitting unnoticed in drawers. It saves us at least ₹20,000 in unsellable stock every quarter.'}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                  AK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Anjali Kulkarni</h4>
                  <p className="text-[11px] text-slate-500">Sanjivani Chemist & Druggist, Pune</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. PRICING SECTION with scroll-mt-24
          ========================================================================= */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isMr ? 'पारदर्शक दर' : 'Simple, Transparent Pricing'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              {isMr ? 'तुमच्या फार्मसीसाठी योग्य प्लॅन निवडा' : 'Affordable Plans for Every Pharmacy'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              {isMr
                ? 'कोणतेही छुपे शुल्क नाही. १४ दिवसांची मोफत चाचणी उपलब्ध.'
                : 'Zero setup fees. Free onboarding. 14-day free trial on all plans.'}
            </p>

            {/* Monthly / Yearly Switcher */}
            <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPricingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  pricingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setPricingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  pricingCycle === 'yearly'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                  pricingCycle === 'yearly' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solo Chemist</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{pricingCycle === 'monthly' ? '499' : '399'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Best for single-counter retail medical stores.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 1 POS Billing Counter
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Auto FEFO Expiry Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Udhaar Ledger + WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 80mm Thermal Receipt Slip
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> English & Marathi Bilingual
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="w-full mt-8 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="p-6 rounded-3xl bg-white border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
                Most Popular for Chemists
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Growth Pharmacy</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{pricingCycle === 'monthly' ? '899' : '699'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Ideal for busy pharmacies with 2-3 billing counters.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2 font-bold text-emerald-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 3 Billing Counters
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Multi-Role Staff Access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Priority WhatsApp Invoicing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Automated Daily Cloud Backup
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> GST GSTR-1 Audit Ready Reports
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="w-full mt-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                Get 14 Days Free
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital / Chain</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{pricingCycle === 'monthly' ? '1,899' : '1,499'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For multi-branch medicals & hospital OPD counters.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited POS Counters
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Central Warehouse Inventory
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Account Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Custom Drug Catalog Migration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Phone Support
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="w-full mt-8 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FAQ ACCORDION SECTION with scroll-mt-24
          ========================================================================= */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isMr ? 'नेहमी विचारले जाणारे प्रश्न (FAQ)' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              {isMr ? 'मेडीइझीबद्दलचे तुमचे प्रश्न आणि त्यांची उत्तरे' : 'Everything you need to know about setting up MedEasy'}
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-900 text-sm flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/40 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. BOTTOM CTA BANNER
          ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isMr ? 'आजच तुमच्या दुकानाचे बिलिंग आधुनिक करा.' : 'Ready to Speed Up Your Pharmacy Counter?'}
          </h2>
          <p className="text-xs sm:text-base text-emerald-100 mt-3 max-w-xl mx-auto">
            {isMr
              ? 'मेडीइझी वापरून पहा आणि एक्सपायरीचे नुकसान थांबवून उधारी वेळेत वसूल करा.'
              : 'Join forward-thinking chemists across Maharashtra. Experience zero-delay billing and clean accounting.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-sm rounded-xl shadow-lg transition cursor-pointer"
            >
              {isMr ? 'थेट काउंटर सुरू करा' : 'Open Live Counter POS'}
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl border border-emerald-500/40 transition cursor-pointer"
            >
              {isMr ? 'मोफत डेमोची विनंती करा' : 'Request On-Site Demo'}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
          ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm">
                +
              </div>
              <span>MedEasy</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Designed for retail pharmacies, dispensing clinics, and chemists across Khed Shivapur, Pune, Satara, and Maharashtra.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Counter App</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => navigate('/billing')} className="hover:text-white transition cursor-pointer">
                  New Retail Bill (POS)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/stock')} className="hover:text-white transition cursor-pointer">
                  Stock & FEFO Batches
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/customers')} className="hover:text-white transition cursor-pointer">
                  Udhaar Customer Ledger
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/purchases')} className="hover:text-white transition cursor-pointer">
                  Supplier Purchase Bills
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Management</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition cursor-pointer">
                  Live Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/reports')} className="hover:text-white transition cursor-pointer">
                  Sales & GST Reports
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/settings')} className="hover:text-white transition cursor-pointer">
                  Disaster Recovery & Backups
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition cursor-pointer">
                  Staff Login
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Compliance & Safety</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Complies with Schedule H/H1 batch tracking requirements, 12%/18% GST calculation standards, and FDA prescription record guidelines.
            </p>
            <p className="text-[11px] text-slate-600 mt-4">
              © 2026 MedEasy Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          11. FLOATING BACK TO TOP BUTTON
          ========================================================================= */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl transition cursor-pointer animate-fade-in"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* =========================================================================
          12. DEMO BOOKING MODAL
          ========================================================================= */}
      <Modal
        isOpen={showDemoModal}
        onClose={() => {
          setShowDemoModal(false);
          setDemoSubmitted(false);
        }}
        title="Book a Free 14-Day Store Trial"
        subtitle="Get MedEasy configured for your medical store with your drug catalog"
        maxWidth="max-w-md"
      >
        {demoSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Demo Request Received!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Namaskar <strong>{chemistName || 'Chemist'}</strong>, our Khed Shivapur support specialist will call you at <strong>{mobileNumber}</strong> within 2 hours to activate your trial.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDemoModal(false);
                  navigate('/dashboard');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
              >
                Explore Live Demo Right Now →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDemoSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Name / Pharmacist *</label>
              <input
                type="text"
                required
                value={chemistName}
                onChange={(e) => setChemistName(e.target.value)}
                placeholder="e.g. Rahul Deshmukh"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medical Store Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Sai Samarth Medical & General"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / WhatsApp No *</label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Town / City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Khed Shivapur / Pune"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Submit Demo Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LandingPage;
