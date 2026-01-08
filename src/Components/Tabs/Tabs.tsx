import { useState } from 'react';
import { Home, Cpu, Wrench, User } from 'lucide-react';
import HomePage from '../../Pages/Home';
import DeviceList from '../../Pages/DeviceList';
import Service from '../../Pages/Service';
import Profile from '../../Pages/Profile';

export default function Tabs() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'service', label: 'Service', icon: Wrench },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Function to render the active page
  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'devices':
        return <DeviceList />;
      case 'service':
        return <Service />;
      case 'profile':
        return <Profile />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="pb-20">
      {/* Content Area - Renders the active page */}
      <div className="min-h-screen">
        {renderActivePage()}
      </div>

      {/* Bottom Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-3 px-4 min-w-[70px] transition-all duration-200 relative ${
                    isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`} 
                  />
                  <span className={`text-xs font-medium ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}