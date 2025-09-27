import { Button } from "@/components/ui/button";
import logo from "@/assets/bookmydoclogo.png";
import { Search, Stethoscope, User, LogIn, UserCircle, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const Navigation = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "home", label: "Home", href: "#" },
    { id: "services", label: "Treatment", href: "#services" },
    { id: "doctors", label: "Our Doctors", href: "#doctors" },
    { id: "about", label: "About", href: "#about" },
  ];

  // Desktop nav animation
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
        duration: 2,
        ease: "power3.out",
        stagger: 0.5,
      });
    }
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
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
    } else if (!mobileMenuOpen && mobileMenuRef.current) {
      gsap.to(mobileMenuRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power3.in",
      });
    }
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16" ref={navRef}>
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="BookMyDoc Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8" ref={navLinksRef}>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`relative text-md font-medium transition-colors hover:text-primary
                  after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
                  after:h-[2px] after:w-0 after:bg-[#2D9CDB] after:transition-all 
                  after:duration-300 hover:after:w-full
                  ${activeItem === item.id ? "text-[#2D9CDB] after:w-full" : "text-muted-foreground"}
                `}
                onClick={() => setActiveItem(item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link to="/symptom_checker">
              <Button 
                variant="outline" 
                size="lg"
                className="hidden lg:flex items-center space-x-2 border-[#1c5a6a] text-[#1c5a6a] hover:bg-[#56CCF2]  hover:border-[#56CCF2] transition-all hover:scale-[1.05] hover:text-primary-foreground duration-300"
              >
                <Stethoscope className="h-4 w-4" />
                <span className="hidden xl:inline">Symptom Checker</span>
              </Button>
            </Link>
            
            <Button 
              size="lg"
              className="hidden sm:flex bg-blue-gradient hover:glow-blue hover:scale-[1.05] hover:bg-[#56CCF2] transition-all duration-300"
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden md:inline">Find Doctor</span>
            </Button>
            
            <div className="hidden lg:flex items-center  space-x-1">
              <Button variant="ghost" size="sm" className="text-xs hover:scale-[1.05] lg:text-sm">
                <LogIn className="h-6 w-6 lg:mr-2" />
                <span className="hidden lg:inline">Login</span>
              </Button>

              <Button variant="ghost" className="hover:scale-[1.05]"  size="sm">
                <UserCircle className="h-10 w-10" />
              </Button>
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
            className="md:hidden fixed top-16 right-0 w-3/4 h-500 bg-background/95 backdrop-blur-md shadow-lg border-l border-border z-40"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`block text-sm font-medium transition-colors hover:text-primary
                    ${activeItem === item.id ? "text-[#56CCF2]" : "text-muted-foreground"}
                  `}
                  onClick={() => {
                    setActiveItem(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </a>
              ))}
              
              <div className="border-t border-border pt-4 space-y-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-center border-primary text-primary hover:bg-[#56CCF2] hover:text-primary-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Symptom Checker
                </Button>
                
                <Button 
                  size="sm"
                  className="w-full bg-blue-gradient hover:shadow-medical  hover:bg-[#56CCF2] duration-100"
                >
                  <User className="h-4 w-4 mr-2" />
                  Find Doctor
                </Button>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <UserCircle className="h-4 w-4" />
                  </Button>
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
