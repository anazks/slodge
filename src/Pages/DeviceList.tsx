import { useState, useEffect, useCallback } from 'react';
import { Cpu, Power, Wifi, RefreshCw, AlertCircle, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { db as database } from '../Firebase';
import { ref, onValue, set, get } from 'firebase/database';

interface Device {
  id: string;
  name: string;
  room: string;
  power: number;
  units: number;
  status: 'online' | 'offline';
  isOn: boolean;
}

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false); // single toggle lock for both
  const [lastUpdated, setLastUpdated] = useState('');

  // Testing area states
  const [production, setProduction] = useState(100);
  const [consumption, setConsumption] = useState(50);
  const [autoControlEnabled, setAutoControlEnabled] = useState(false);
  const [testingLog, setTestingLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestingLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  // Fetch initial devices
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const rootRef = ref(database, '/');
      const snapshot = await get(rootRef);
      const data = snapshot.val();
      console.log("Firebase data fetched:", data);

      if (!data) {
        setDevices([]);
        return;
      }

      const loadedDevices: Device[] = Object.entries(data)
        .filter(([key, value]) => {
          const isDeviceKey = key === 'Fan' || key === 'Light';
          const isValidValue = typeof value === 'number' && (value === 0 || value === 1);
          return isDeviceKey && isValidValue;
        })
        .map(([key, value]: [string, any]) => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
          room: key === 'Fan' ? 'Bedroom' : 'Living Room',
          power: key === 'Fan' ? 75 : 60,
          units: key === 'Fan' ? 1.8 : 0.4,
          status: 'online' as const,
          isOn: value === 0, // Inverted: 0 = ON, 1 = OFF
        }));

      setDevices(loadedDevices);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err: any) {
      console.error("Firebase fetch error:", err);
      setError(`Failed to fetch devices: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup real-time listener
  useEffect(() => {
    const rootRef = ref(database, '/');
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase real-time update:", data);

      if (!data) {
        setDevices([]);
        return;
      }

      setDevices(prevDevices =>
        prevDevices.map(device => {
          if (data[device.id] !== undefined) {
            return {
              ...device,
              isOn: data[device.id] === 0, // Inverted
            };
          }
          return device;
        })
      );
      setLastUpdated(new Date().toLocaleTimeString());
    }, (err) => {
      console.error("Firebase listener error:", err);
      setError(`Realtime connection lost: ${err.message}`);
    });

    fetchDevices();
    return () => unsubscribe();
  }, [fetchDevices]);

  // Auto-control logic - monitors production vs consumption
  useEffect(() => {
    if (!autoControlEnabled) return;

    const totalConsumptionW = devices.reduce((sum, d) => sum + (d.isOn ? d.power : 0), 0);

    const isProductionLow = production < 60;
    const isConsumptionHigh = totalConsumptionW > 80;

    if (isProductionLow && isConsumptionHigh) {
      const onDevices = devices.filter(d => d.isOn);
      if (onDevices.length > 0) {
        addLog(`⚠️ Low production (${production}W) & high consumption (${totalConsumptionW}W) → turning OFF both`);
        setIsToggling(true);
        Promise.all([
          set(ref(database, 'Fan'), 1),
          set(ref(database, 'Light'), 1),
        ])
          .then(() => {
            addLog('✓ Both Fan and Light turned OFF automatically');
          })
          .catch(err => {
            addLog(`✗ Auto turn-off failed: ${err.message}`);
          })
          .finally(() => setIsToggling(false));
      }
    }
  }, [production, consumption, autoControlEnabled, devices]);

  // Toggle both Fan + Light together
  const toggleBoth = async () => {
    if (isToggling) return;

    const fan = devices.find(d => d.id === 'Fan');
    if (!fan) return;

    const currentIsOn = fan.isOn;
    const newValue = currentIsOn ? 1 : 0; // 0 = ON, 1 = OFF

    setIsToggling(true);

    // Optimistic update
    setDevices(prev =>
      prev.map(d => ({ ...d, isOn: !currentIsOn }))
    );

    try {
      await Promise.all([
        set(ref(database, 'Fan'), newValue),
        set(ref(database, 'Light'), newValue),
      ]);
      addLog(`Manual: Fan & Light turned ${newValue === 0 ? 'ON' : 'OFF'}`);
    } catch (err: any) {
      console.error(err);
      // Revert
      setDevices(prev =>
        prev.map(d => ({ ...d, isOn: currentIsOn }))
      );
      setError(`Failed to toggle both devices: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsToggling(false);
    }
  };

  // Calculate statistics
  const activeDevices = devices.filter(d => d.isOn).length;
  const totalConsumption = devices
    .reduce((sum, d) => sum + (d.isOn ? d.units : 0), 0)
    .toFixed(1);

  const powerBalance = production - consumption;
  const balanceColor = powerBalance >= 0 ? 'text-green-600' : 'text-red-600';

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading devices...</p>
        </div>
      </div>
    );
  }

  // Determine current state from Fan (since both are synced)
  const bothAreOn = devices.find(d => d.id === 'Fan')?.isOn ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Cpu className="text-blue-600" />
                Connected Devices
              </h1>
              <p className="text-gray-500 mt-1">Control your home appliances</p>
            </div>
            <button
              onClick={fetchDevices}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-400 mt-2">Updated: {lastUpdated}</p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Testing Area */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="text-purple-600" />
              Testing Area - Auto Control
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Auto Control
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoControlEnabled}
                  onChange={(e) => {
                    setAutoControlEnabled(e.target.checked);
                    addLog(e.target.checked ? '🤖 Auto-control ENABLED' : '🛑 Auto-control DISABLED');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Production Slider */}
            <div className="bg-white rounded-xl p-5 shadow">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Solar Production
                </label>
                <span className="text-2xl font-bold text-green-600">
                  {production}W
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={production}
                onChange={(e) => setProduction(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-yellow-200 to-green-500 rounded-lg appearance-none cursor-pointer accent-green-600"
                style={{
                  background: `linear-gradient(to right, #fef08a ${production / 2} %, #22c55e ${production / 2} %)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0W</span>
                <span>100W</span>
                <span>200W</span>
              </div>
            </div>

            {/* Consumption Slider */}
            <div className="bg-white rounded-xl p-5 shadow">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Total Consumption
                </label>
                <span className="text-2xl font-bold text-red-600">
                  {consumption}W
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={consumption}
                onChange={(e) => setConsumption(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-blue-200 to-red-500 rounded-lg appearance-none cursor-pointer accent-red-600"
                style={{
                  background: `linear-gradient(to right, #bfdbfe ${consumption / 2} %, #ef4444 ${consumption / 2} %)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0W</span>
                <span>100W</span>
                <span>200W</span>
              </div>
            </div>
          </div>

          {/* Power Balance */}
          <div className="bg-white rounded-xl p-5 shadow mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Power Balance:</span>
              <span className={`text-2xl font-bold ${balanceColor}`}>
                {powerBalance > 0 ? '+' : ''}{powerBalance}W
              </span>
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  powerBalance >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(Math.abs(powerBalance) / 2, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {powerBalance >= 0
                ? `✓ Surplus energy available`
                : `⚠️ Consuming more than producing`}
            </p>
          </div>

          {/* Auto-Control Info */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Auto-Control Logic:</strong> When production drops below 60W AND consumption exceeds 80W,
              both devices will automatically turn OFF to prevent power deficit.
            </p>
          </div>

          {/* Testing Log */}
          <div className="mt-4 bg-gray-900 rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs text-gray-300">
            <h3 className="text-sm font-semibold text-green-400 mb-2">Activity Log:</h3>
            {testingLog.length === 0 ? (
              <p className="text-gray-500">No activity yet...</p>
            ) : (
              <div className="space-y-1">
                {testingLog.map((log, idx) => (
                  <p key={idx}>{log}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 mb-1">Total Devices</p>
            <p className="text-3xl font-bold text-gray-800">2</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500 mb-1">Online</p>
            <p className="text-3xl font-bold text-gray-800">2</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 mb-1">Active (ON)</p>
            <p className="text-3xl font-bold text-gray-800">{activeDevices}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 mb-1">Total Units</p>
            <p className="text-3xl font-bold text-gray-800">{totalConsumption}</p>
          </div>
        </div>

        {/* Devices Grid - only Fan card controlling both */}
        {devices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Devices Found</h3>
            <p className="text-gray-500 mb-4">
              Add "Fan" or "Light" keys with values 0 or 1 in Firebase Realtime Database
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto text-left">
              <p className="text-sm text-gray-600 mb-2">Expected structure:</p>
              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`{
  "Fan": 1,
  "Light": 0
}`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Only show Fan card - controls both */}
            {devices
              .filter((d) => d.id === 'Fan')
              .map((device) => (
                <div
                  key={device.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className={`h-2 ${bothAreOn ? 'bg-green-500' : 'bg-gray-300'}`}></div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          Fan + Light
                          {isToggling && (
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">Bedroom & Living Room</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Power (total)</span>
                        <span className="font-semibold text-gray-800">135 W</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Consumption (total)</span>
                        <span className="font-semibold text-gray-800">2.2 kWh</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <span
                          className={`font-semibold ${
                            bothAreOn ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {bothAreOn ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={toggleBoth}
                      disabled={isToggling || loading}
                      className={`w-full py-4 px-6 rounded-xl text-white font-medium text-lg flex items-center justify-center gap-3 transition-all ${
                        bothAreOn
                          ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      } ${isToggling ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <Power className="w-6 h-6" />
                      TURN {bothAreOn ? 'OFF' : 'ON'} FAN AND LIGHT
                      {isToggling && '...'}
                    </button>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                      Controls both Fan and Light simultaneously
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Connection Status */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 text-white text-xs">
          <p className="mb-1">
            <strong>Firebase URL:</strong> https://solariot-c3f71-default-rtdb.firebaseio.com/
          </p>
          <p>
            <strong>Database Location:</strong> United States (us-central1)
          </p>
        </div>
      </div>
    </div>
  );
}