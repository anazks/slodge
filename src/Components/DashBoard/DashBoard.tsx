import { useState, useEffect } from "react";
import { 
  Sun, BatteryCharging, IndianRupee, Leaf, Zap, 
  Thermometer, Droplets, Wind, AlertTriangle,
  Home, Settings, Clock, Activity, Bell
} from "lucide-react";

export default function SOLEdgeDashboard() {
  const [automationMode, setAutomationMode] = useState("saver");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorData, setSensorData] = useState({
    temperature: 28.5,
    humidity: 65,
    battery: 87
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate sensor data updates
      setSensorData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
      }));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Format time
  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sun className="w-6 h-6 text-yellow-500" />
                SOLEdge Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Smart solar management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Time</div>
                <div className="text-lg font-semibold text-gray-900">{formattedTime}</div>
              </div>
              <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex gap-4 items-center bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">System Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <span className="text-sm">ML: 94% Accuracy</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Automation Mode */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Automation Mode</h2>
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAutomationMode("saver")}
                className={`flex-1 p-3 rounded-lg border ${automationMode === "saver" ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-200"}`}
              >
                <Leaf className="w-4 h-4 mx-auto mb-1" />
                Saver
              </button>
              <button
                onClick={() => setAutomationMode("performance")}
                className={`flex-1 p-3 rounded-lg border ${automationMode === "performance" ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "bg-gray-50 border-gray-200"}`}
              >
                <Zap className="w-4 h-4 mx-auto mb-1" />
                Vacation Mode
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {automationMode === "saver" ? "Optimizing for peak hours" : "Maximum output"}
            </p>
          </div>

          {/* Energy Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Today's Production" 
              value="28.4 kWh" 
              icon={<Sun className="w-5 h-5" />} 
              color="bg-yellow-50"
            />
            <StatCard 
              title="Current Output" 
              value="3.2 kW" 
              icon={<Zap className="w-5 h-5" />} 
              color="bg-blue-50"
            />
            <StatCard 
              title="Total Savings" 
              value="₹8,542" 
              icon={<IndianRupee className="w-5 h-5" />} 
              color="bg-green-50"
            />
          </div>

          {/* Sensors */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sensors</h3>
            <div className="space-y-3">
              <SensorItem 
                name="Temperature"
                value={`${sensorData.temperature.toFixed(1)}°C`}
                icon={<Thermometer className="w-5 h-5 text-red-500" />}
              />
              <SensorItem 
                name="Humidity"
                value={`${sensorData.humidity}%`}
                icon={<Droplets className="w-5 h-5 text-blue-500" />}
              />
              <SensorItem 
                name="Battery"
                value={`${sensorData.battery}%`}
                icon={<BatteryCharging className="w-5 h-5 text-green-500" />}
              />
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Alerts
            </h3>
            <div className="space-y-2">
              <AlertItem 
                type="info"
                message="High solar output predicted"
              />
              <AlertItem 
                type="warning"
                message="Check gas sensor"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Component: Stat Card */
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} rounded-lg p-4 border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

/* Component: Sensor Item */
function SensorItem({ name, value, icon }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100">
          {icon}
        </div>
        <div className="font-medium text-gray-900">{name}</div>
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

/* Component: Alert Item */
function AlertItem({ type, message }) {
  const typeConfig = {
    info: { icon: "ℹ️", color: "bg-blue-50 text-blue-800" },
    warning: { icon: "⚠️", color: "bg-yellow-50 text-yellow-800" }
  };

  return (
    <div className={`${typeConfig[type].color} rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        <span>{typeConfig[type].icon}</span>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}