import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1B4F72] text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#2D9CDB] rounded-full p-2">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">BookMyDoc</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Your trusted healthcare partner providing exceptional medical care with experienced doctors and modern facilities.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-background/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-background/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-background/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-background/10">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Our Doctors</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Medical Services</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Health Packages</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Lab Tests</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Emergency Care</a></li>
            </ul>
          </div>

          {/* Medical Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Medical Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Cardiology</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Neurology</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Pediatrics</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Orthopedics</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Dermatology</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">General Surgery</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 text-[#2D9CDB]" />
                <div>
                  <p className="text-background/70">123 Medical Center Drive</p>
                  <p className="text-background/70">New York, NY 10001</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#2D9CDB]" />
                <a href="tel:+1234567890" className="text-background/70 hover:text-background transition-colors">
                  +1 (234) 567-8900
                </a>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#2D9CDB]" />
                <a href="mailto:info@mediscape.com" className="text-background/70 hover:text-background transition-colors">
                  info@bookmydoc.com
                </a>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 text-[#2D9CDB]" />
                <div>
                  <p className="text-background/70">Mon - Fri: 8:00 AM - 8:00 PM</p>
                  <p className="text-background/70">Sat - Sun: 9:00 AM - 6:00 PM</p>
                  <p className="text-[#2D9CDB] font-medium">24/7 Emergency Care</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-background/20 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-xl font-semibold mb-2">Stay Updated</h4>
              <p className="text-background/70 text-sm">
                Subscribe to our newsletter for health tips and medical updates
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter your email address"
                className="bg-background/10 border-background/30 text-background placeholder:text-background/50 focus:border-primary"
              />
              <Button className="bg-[#2D9CDB] hover:shadow-medical transition-all duration-300 px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-background/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-background/70">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2024 BookMyDoc. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;