import { useState, useEffect, useCallback } from 'react';
import { Cpu, Power, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
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
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');

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
          // Accept only Fan and Light keys with numeric values
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
          status: 'online',
          isOn: value === 1,
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
              isOn: data[device.id] === 1,
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

    // Initial fetch
    fetchDevices();

    return () => unsubscribe();
  }, [fetchDevices]);

  // Toggle device state
  const toggleDevice = async (deviceId: string, currentIsOn: boolean) => {
    if (isToggling[deviceId]) return;
    
    setIsToggling(prev => ({ ...prev, [deviceId]: true }));
    
    const newValue = currentIsOn ? 0 : 1;
    const deviceRef = ref(database, deviceId);

    // Optimistic UI update
    setDevices(prev => prev.map(device =>
      device.id === deviceId ? { ...device, isOn: !currentIsOn } : device
    ));

    try {
      await set(deviceRef, newValue);
      console.log(`${deviceId} successfully updated to ${newValue}`);
    } catch (err: any) {
      console.error("Firebase write error:", err);
      
      // Revert optimistic update
      setDevices(prev => prev.map(device =>
        device.id === deviceId ? { ...device, isOn: currentIsOn } : device
      ));
      
      setError(`Failed to control ${deviceId}: ${err.message}`);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsToggling(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Calculate statistics
  const activeDevices = devices.filter(d => d.isOn).length;
  const totalConsumption = devices
    .reduce((sum, d) => sum + (d.isOn ? d.units : 0), 0)
    .toFixed(1);

  if (loading && devices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Cpu className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                Connected Devices
              </h1>
              <p className="text-gray-600">Control your home appliances</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDevices}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg border shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Devices</p>
            <p className="text-2xl font-bold">{devices.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Online</p>
            <p className="text-2xl font-bold">{devices.filter(d => d.status === 'online').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Active (ON)</p>
            <p className="text-2xl font-bold">{activeDevices}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Units</p>
            <p className="text-2xl font-bold">{totalConsumption}</p>
          </div>
        </div>

        {/* Devices Grid */}
        {devices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <Cpu className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Devices Found</h3>
              <p className="text-gray-500 mb-6">
                Add "Fan" or "Light" keys with values 0 or 1 in Firebase Realtime Database
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-left text-sm font-mono">
                <p className="text-gray-600">Expected structure:</p>
                <p className="text-green-600 mt-1">"Fan": 1</p>
                <p className="text-green-600">"Light": 0</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map(device => (
              <div 
                key={device.id} 
                className={`bg-white rounded-2xl shadow-lg p-6 border transition-all duration-300 ${
                  device.isOn ? 'border-blue-200' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{device.name}</h3>
                      {isToggling[device.id] && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{device.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Power</span>
                    <span className="font-medium">{device.power} W</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Consumption</span>
                    <span className="font-medium">{device.units} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      device.isOn 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {device.isOn ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDevice(device.id, device.isOn)}
                  disabled={isToggling[device.id] || loading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                    device.isOn
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  } ${isToggling[device.id] ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <Power className="w-5 h-5" />
                  {device.isOn ? 'Turn OFF' : 'Turn ON'}
                  {isToggling[device.id] && '...'}
                </button>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center text-xs text-gray-500">
                    Device ID: <span className="font-mono">{device.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Firebase URL: https://solariot-c3f71-default-rtdb.firebaseio.com/</p>
          <p className="mt-1">Database Location: United States (us-central1)</p>
        </div>
      </div>
    </div>
  );
}