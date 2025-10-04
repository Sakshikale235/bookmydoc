import { Button } from "@/components/ui/button";
import { Search, Stethoscope, User, LogIn, UserCircle, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import logo from "@/assets/bookmydoclogo.png";

const Navigation = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "services", label: "Treatment", href: "#services" },
    { id: "doctors", label: "Our Doctors", href: "#doctors" },
    { id: "about", label: "About", href: "#about" },
  ];

  const isSymptomCheckerPage = location.pathname === "/symptom_checker";
  const isDoctorConsultationPage = location.pathname === "/doctor_consultation";
  const isUserProfilePage = location.pathname === "/user_profile";

  // Update active nav item
  useEffect(() => {
    if (isSymptomCheckerPage || isDoctorConsultationPage || isUserProfilePage) {
      setActiveItem("");
    } else if (location.pathname === "/") {
      setActiveItem("home");
    } else {
      setActiveItem("");
    }
  }, [location.pathname, isSymptomCheckerPage, isDoctorConsultationPage, isUserProfilePage]);

  // GSAP animations for desktop
  useEffect(() => {
    if (navRef.current) {
      gsap.from(navRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }
    if (navLinksRef.current) {
      gsap.from(navLinksRef.current.children, {
        x: -30,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        stagger: 0.3,
      });
    }
  }, []);

  // GSAP animations for mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { x: "100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 0.6, ease: "power3.out" }
        );
        gsap.from(mobileMenuRef.current.querySelectorAll("a, button"), {
          x: 30,
          opacity: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.1,
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          x: "100%",
          opacity: 0,
          duration: 0.5,
          ease: "power3.in",
        });
      }
    }
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16" ref={navRef}>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BookMyDoc Logo" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" ref={navLinksRef}>
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`relative text-md font-medium transition-colors hover:text-primary
                  after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
                  after:h-[2px] after:w-0 after:bg-[#2D9CDB] after:transition-all 
                  after:duration-300 hover:after:w-full
                  ${activeItem === item.id && !isSymptomCheckerPage ? "text-[#2D9CDB] after:w-full" : "text-muted-foreground"}
                `}
                onClick={() => !isSymptomCheckerPage && setActiveItem(item.id)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link to="/symptom_checker">
              <Button
                variant="outline"
                size="lg"
                className={`hidden lg:flex items-center space-x-2 border-[#1c5a6a] text-[#1c5a6a] 
                  transition-all duration-300 hover:scale-[1.05] hover:bg-[#56CCF2] hover:border-[#56CCF2] hover:text-primary-foreground
                  ${isSymptomCheckerPage ? "bg-[#56CCF2] border-[#56CCF2] text-white scale-[1.05]" : ""}
                `}
              >
                <Stethoscope className="h-4 w-4" />
                <span className="hidden xl:inline">Symptom Checker</span>
              </Button>
            </Link>

            <Link to="/doctor_consultation">
              <Button
                size="lg"
                className={`hidden sm:flex transition-all duration-300 hover:scale-[1.05]
                  ${isDoctorConsultationPage
                    ? "bg-[#56CCF2] border-[#56CCF2] text-white"
                    : "bg-blue-gradient hover:glow-blue hover:bg-[#56CCF2]"
                  }
                `}
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden md:inline">Find Doctor</span>
              </Button>
            </Link>

            {/* Profile & Login Buttons */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs hover:scale-[1.05] lg:text-sm">
                  <LogIn className="h-6 w-6 lg:mr-2" />
                  <span className="hidden lg:inline">Login</span>
                </Button>
              </Link>
              <Link to="/user_profile">
                <Button variant="ghost" size="sm" className="hover:scale-[1.05]">
                  <UserCircle className="h-10 w-10" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden fixed top-16 right-0 w-3/4 h-[500px] bg-background/95 backdrop-blur-md shadow-lg border-l border-border z-40"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`block text-sm font-medium transition-colors hover:text-primary
                    ${activeItem === item.id && !isSymptomCheckerPage ? "text-[#56CCF2]" : "text-muted-foreground"}
                  `}
                  onClick={() => {
                    if (!isSymptomCheckerPage) setActiveItem(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-border pt-4 space-y-3">
                <Link to="/symptom_checker">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full justify-center transition-all duration-300
                      ${isSymptomCheckerPage
                        ? "bg-[#56CCF2] border-[#56CCF2] text-white"
                        : "border-primary text-primary hover:bg-[#56CCF2] hover:text-primary-foreground"
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Symptom Checker
                  </Button>
                </Link>

                <Link to="/doctor_consultation">
                  <Button
                    size="sm"
                    className={`w-full duration-100
                      ${isDoctorConsultationPage
                        ? "bg-[#56CCF2] border-[#56CCF2] text-white"
                        : "bg-blue-gradient hover:shadow-medical hover:bg-[#56CCF2]"
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Find Doctor
                  </Button>
                </Link>

                <div className="flex space-x-2">
                  <Link to="/login" className="flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full flex items-center justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/user_profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full flex items-center justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
