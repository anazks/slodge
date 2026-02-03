import { useState, useEffect } from "react";
import { 
  User,Settings, Bell, Shield, LogOut, Edit,
  Server, Save, CheckCircle, AlertCircle
} from 'lucide-react';

export default function Profile() {
  const userProfile = {
    name: 'Ann',
    email: 'Ann@email.com',
    phone: '+918606414384',
    location: 'Kochi, Kerala',
    joinedDate: 'January 2024',
    systemSize: '5 kW',
    installDate: 'March 2024',
  };

  // IP Address handling
  const [ipAddress, setIpAddress] = useState<string>("");
  const [savedIp, setSavedIp] = useState<string | null>(null);
  const [ipError, setIpError] = useState<string | null>(null);
  const [ipSuccess, setIpSuccess] = useState(false);

  // Load saved IP from localStorage on mount
  useEffect(() => {
    const storedIp = localStorage.getItem("deviceIpAddress");
    if (storedIp) {
      setSavedIp(storedIp);
      setIpAddress(storedIp); // pre-fill input
    }
  }, []);

  // Simple IPv4 validation (basic, not perfect)

  const handleSaveIp = () => {
    setIpError(null);
    setIpSuccess(false);

    if (!ipAddress.trim()) {
      setIpError("Please enter an IP address");
      return;
    }

   
    // Save to localStorage
    localStorage.setItem("deviceIpAddress", ipAddress.trim());
    setSavedIp(ipAddress.trim());
    setIpSuccess(true);

    // Clear success message after 4 seconds
    setTimeout(() => setIpSuccess(false), 4000);
  };

  const menuItems = [
    { icon: Settings, label: 'Account Settings', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Bell, label: 'Notifications', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: Shield, label: 'Privacy & Security', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: LogOut, label: 'Logout', color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 text-lg">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
          {/* ... existing profile card content remains unchanged ... */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {userProfile.name}
              </h2>
              <p className="text-gray-600">Solar System Owner</p>
            </div>

            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Contact Details - unchanged */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ... existing contact cards ... */}
          </div>
        </div>

        {/* New: Device IP Address Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Device Connection</h3>
          </div>

          <div className="space-y-4">
            {savedIp && (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium">Currently connected to:</p>
                <p className="text-lg font-semibold text-indigo-900 mt-1">{savedIp}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Device IP Address (e.g., 192.168.1.100)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => {
                    setIpAddress(e.target.value);
                    setIpError(null);
                    setIpSuccess(false);
                  }}
                  placeholder="192.168.1.100"
                  className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    ipError 
                      ? "border-red-500 focus:ring-red-200" 
                      : "border-gray-300 focus:ring-indigo-200 focus:border-indigo-500"
                  }`}
                />
                <button
                  onClick={handleSaveIp}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
                  disabled={!ipAddress.trim()}
                >
                  <Save className="w-5 h-5" />
                  Save IP
                </button>
              </div>

              {ipError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {ipError}
                </div>
              )}

              {ipSuccess && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  IP address saved successfully!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          {/* ... existing system details ... */}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="flex-1 text-left font-semibold text-gray-900">
                  {item.label}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}