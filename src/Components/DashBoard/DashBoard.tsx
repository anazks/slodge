import { useState, useEffect } from "react";
import { 
  Sun, BatteryCharging, IndianRupee, Leaf, Zap, 
  Thermometer, Droplets, Settings, Activity, Bell,
  Gauge
} from "lucide-react";
import { db } from '../../Firebase';           
import { ref, onValue } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged, FirebaseError } from 'firebase/auth';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface SensorItemProps {
  name: string;
  value: string;
  icon: React.ReactNode;
}

interface AlertItemProps {
  type: 'info' | 'warning';
  message: string;
}

export default function SOLEdgeDashboard() {
  const [automationMode, setAutomationMode] = useState("saver");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorData, setSensorData] = useState({
    temperature: "—",
    humidity: "—",
    battery: 87
  });
  const [predictedConsumption, setPredictedConsumption] = useState<string>("—");
  const [sensorsLoading, setSensorsLoading] = useState(true);
  const [sensorsError, setSensorsError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deviceIp, setDeviceIp] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'signed-in' | 'error'>('loading');

  // Load IP from localStorage
  useEffect(() => {
    const storedIp = localStorage.getItem("deviceIpAddress");
    console.log("[Profile] Loaded IP from localStorage:", storedIp);
    if (storedIp) {
      setDeviceIp(storedIp);
    } else {
      console.log("[Profile] No IP found in localStorage");
    }
  }, []);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Anonymous Authentication
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("[Auth] Already signed in (anonymous) → UID:", user.uid);
        setAuthStatus('signed-in');
      } else {
        console.log("[Auth] No user → attempting anonymous sign-in");
        signInAnonymously(auth)
          .then((userCredential) => {
            console.log("[Auth] Anonymous sign-in successful → UID:", userCredential.user.uid);
            setAuthStatus('signed-in');
          })
          .catch((error: FirebaseError) => {  // ← typed as FirebaseError
            console.error("[Auth] Anonymous sign-in failed:", error.code, error.message);
            setAuthStatus('error');
            if (error.code === 'auth/operation-not-allowed') {
              setSensorsError("Anonymous authentication is not enabled in Firebase console");
            } else {
              setSensorsError("Authentication failed – check console for details");
            }
          });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Firebase listener for temperature & humidity – only after auth is ready
  useEffect(() => {
    if (authStatus !== 'signed-in') {
      console.log("[Firebase] Waiting for authentication before starting listeners");
      return;
    }

    const tempRef = ref(db, '/sensorData/temperature');
    const humRef  = ref(db, '/sensorData/humidity');

    console.log("[Firebase] Starting listeners for /sensorData/...");

    const unsubscribeTemp = onValue(tempRef, (snapshot) => {
      const val = snapshot.val();
      console.log("[Firebase] Temperature raw value:", val);
      setSensorData(prev => ({
        ...prev,
        temperature: typeof val === 'number' ? val.toFixed(1) : "—"
      }));
      setSensorsLoading(false);
    }, (err: FirebaseError) => {           // ← typed as FirebaseError
      console.error("[Firebase] Temperature listener error:", err.code, err.message);
      setSensorsError("Failed to load temperature: " + err.message);
      setSensorsLoading(false);
    });

    const unsubscribeHum = onValue(humRef, (snapshot) => {
      const val = snapshot.val();
      console.log("[Firebase] Humidity raw value:", val);
      setSensorData(prev => ({
        ...prev,
        humidity: typeof val === 'number' ? Math.round(val) + "%" : "—"
      }));
      setSensorsLoading(false);
    }, (err: FirebaseError) => {            // ← typed as FirebaseError
      console.error("[Firebase] Humidity listener error:", err.code, err.message);
      setSensorsError("Failed to load humidity: " + err.message);
      setSensorsLoading(false);
    });

    return () => {
      unsubscribeTemp();
      unsubscribeHum();
    };
  }, [authStatus]);

  // Call prediction API when temperature is available + IP exists
  useEffect(() => {
    if (!deviceIp) {
      console.log("[API] Skipping prediction: No device IP set");
      setApiError("No device IP configured in Profile");
      return;
    }

    if (sensorData.temperature === "—" || sensorsLoading) {
      console.log("[API] Skipping prediction: Temperature not loaded yet");
      return;
    }

    const currentTemp = parseFloat(sensorData.temperature);
    if (isNaN(currentTemp)) {
      console.log("[API] Skipping prediction: Invalid temperature value");
      return;
    }

    const maxTemp = Number((currentTemp + 3).toFixed(1));
    const minTemp = Number((currentTemp - 5).toFixed(1));

    console.log(`[API] Preparing request → IP: ${deviceIp}, max_temp: ${maxTemp}, min_temp: ${minTemp}`);

    const fetchPrediction = async () => {
      try {
        console.log("[API] Sending POST request to:", `http://${deviceIp}/minimumtemp`);

        const response = await fetch(`http://${deviceIp}/minimumtemp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            max_temp: maxTemp,
            min_temp: minTemp
          }),
        });

        console.log("[API] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log("[API] Full response data:", data);

        if (typeof data.predicted_consumption_kwh === 'number') {
          const value = data.predicted_consumption_kwh.toFixed(2);
          console.log("[API] Success - Predicted:", value);
          setPredictedConsumption(value);
          setApiError(null);
        } else {
          setApiError("Invalid response format from device");
        }
      } catch (err: any) {
        console.error("[API] Fetch error:", err);
        const errorMsg = err.message.includes("fetch") 
          ? `Cannot reach device at ${deviceIp} – is it online?`
          : err.message;
        setApiError(errorMsg);
      }
    };

    fetchPrediction();

    const interval = setInterval(fetchPrediction, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [deviceIp, sensorData.temperature, sensorsLoading]);

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
          <div className="flex gap-4 items-center bg-white rounded-lg p-3 shadow-sm mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${deviceIp ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm">
                {deviceIp ? `Device IP: ${deviceIp}` : "No device IP set"}
              </span>
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
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  automationMode === "saver" 
                    ? "bg-green-50 border-green-300 text-green-700 font-medium" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Leaf className="w-4 h-4 mx-auto mb-1" />
                Saver
              </button>
              <button
                onClick={() => setAutomationMode("performance")}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  automationMode === "performance" 
                    ? "bg-yellow-50 border-yellow-300 text-yellow-700 font-medium" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Zap className="w-4 h-4 mx-auto mb-1" />
                Performance
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {automationMode === "saver" 
                ? "Energy saving & battery priority" 
                : "Maximum solar production"}
            </p>
          </div>

          {/* Energy Stats + Prediction */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <StatCard 
              title="Predicted Consumption" 
              value={predictedConsumption === "—" ? "—" : `${predictedConsumption} kWh`} 
              icon={<Gauge className="w-5 h-5" />} 
              color={apiError ? "bg-red-50" : "bg-indigo-50"}
            />
          </div>

          {/* Sensors */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              Live Environment
            </h3>

            {authStatus === 'loading' ? (
              <div className="text-gray-500 text-center py-4 animate-pulse">
                Authenticating...
              </div>
            ) : authStatus === 'error' ? (
              <div className="text-red-600 text-center py-4">
                {sensorsError || "Authentication issue – check console"}
              </div>
            ) : sensorsError ? (
              <div className="text-red-600 text-center py-4">
                {sensorsError}
              </div>
            ) : sensorsLoading ? (
              <div className="text-gray-500 text-center py-4 animate-pulse">
                Loading sensor data...
              </div>
            ) : (
              <div className="space-y-4">
                <SensorItem 
                  name="Temperature"
                  value={sensorData.temperature === "—" ? "—" : `${sensorData.temperature} °C`}
                  icon={<Thermometer className="w-5 h-5 text-red-500" />}
                />
                <SensorItem 
                  name="Humidity"
                  value={sensorData.humidity}
                  icon={<Droplets className="w-5 h-5 text-blue-500" />}
                />
                <SensorItem 
                  name="Battery"
                  value={`${sensorData.battery}%`}
                  icon={<BatteryCharging className="w-5 h-5 text-green-500" />}
                />
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Alerts
            </h3>
            <div className="space-y-2">
              <AlertItem type="info" message="High solar output predicted for next 2 hours" />
              <AlertItem type="warning" message="Humidity above 80% – check ventilation" />
            </div>
          </div>

          {/* API error message */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
              {apiError} (IP: {deviceIp || "not set"})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*               Reusable Components              */
/* ────────────────────────────────────────────── */

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 border border-gray-200 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 font-medium">{title}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function SensorItem({ name, value, icon }: SensorItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-gray-100">
          {icon}
        </div>
        <div className="font-medium text-gray-800">{name}</div>
      </div>
      <div className={`font-semibold ${value === "—" ? "text-gray-400" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

function AlertItem({ type, message }: AlertItemProps) {
  const config = {
    info: { icon: "ℹ️", color: "bg-blue-50 text-blue-800 border-blue-200" },
    warning: { icon: "⚠️", color: "bg-yellow-50 text-yellow-800 border-yellow-200" }
  };

  return (
    <div className={`${config[type].color} rounded-lg p-3 border`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{config[type].icon}</span>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}