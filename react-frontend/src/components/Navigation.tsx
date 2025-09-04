import { Button } from "@/components/ui/button";
import { Search, Stethoscope, User, LogIn, UserCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", href: "#" },
    { id: "services", label: "Treatment", href: "#services" },
    { id: "doctors", label: "Our Doctors", href: "#doctors" },
    { id: "about", label: "About", href: "#about" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
    src="/src/assets/bookmydoclogo.png" 
    alt="BookMyDoc Logo" 
    className="h-12 w-auto object-contain"
  />
            {/* <div className="bg-gradient-primary rounded-full p-2"> */}
            {/* <div className="bg-blue-600 rounded-full p-2">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BookMyDoc</span> */}
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeItem === item.id ? "text-[#2D9CDB]" : "text-muted-foreground"
                }`}
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
              size="sm"
              className="hidden lg:flex items-center space-x-2 border-[#2D9CDB] text-[#2D9CDB] hover:bg-[#56CCF2] hover:text-primary-foreground"
            >
              <Stethoscope className="h-4 w-4" />
              <span className="hidden xl:inline">Symptom Checker</span>
            </Button>
            </Link>
            
            <Button 
              size="sm"
              className="hidden sm:flex bg-[#2D9CDB] hover:shadow-medical hover:bg-[#56CCF2] transition-all duration-300"
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden md:inline">Find Doctor</span>
            </Button>
            
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm">
                <LogIn className="h-6 w-6 lg:mr-2" />
                <span className="hidden lg:inline">Login</span>
              </Button>

              <Button variant="ghost" size="medium">
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
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`block text-sm font-medium transition-colors hover:text-primary ${
                    activeItem === item.id ? "text-[#56CCF2]" : "text-muted-foreground"
                  }`}
                  onClick={() => {
                    setActiveItem(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </a>
              ))}
              
              <div className="border-t border-border pt-4 space-y-3">
                {/* className="w-full justify-center border-primary text-primary hover:bg-primary hover:text-primary-foreground" */}
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
                  className="w-full bg-[#2D9CDB] hover:shadow-medical transition-all hover:bg-[#56CCF2] duration-300"
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