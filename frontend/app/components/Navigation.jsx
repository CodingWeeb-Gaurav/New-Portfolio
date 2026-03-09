// src/components/Navigation.jsx
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import PlaySong from './styles/PlaySong';
export default function Navigation({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { direction: 'center', label: 'Home' },
    // { direction: 'top', label: 'Personal' },
    { direction: 'bottom', label: 'Skills' },
    { direction: 'left', label: 'Timeline' },
    { direction: 'right', label: 'Projects' },
  ];

  const handleClick = (direction) => {
    onNavigate?.(direction);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-md' : 'bg-gray-900/80 backdrop-blur-md'
      } border-b border-gray-800`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">
  {/* Logo */}
  <div className="flex items-center space-x-4 text-3xl font-extrabold tracking-wider">
  <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
    GKG
  </span>
  <PlaySong />
</div>


  {/* Desktop Navigation Buttons */}
  <div className="hidden md:flex space-x-6">
    {navLinks.map((link) => (
      <button
        key={link.direction}
        onClick={() => handleClick(link.direction)}
        className="text-lg font-semibold text-white hover:text-purple-400 transition-colors duration-300"
      >
        {link.label}
      </button>
    ))}
  </div>

  {/* Mobile Hamburger */}
  <div className="md:hidden">
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="text-white hover:text-purple-400"
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>
</div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.direction}
                  onClick={() => handleClick(link.direction)}
                  className="block px-3 py-2 text-white hover:text-purple-400 transition-colors duration-300 w-full text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
