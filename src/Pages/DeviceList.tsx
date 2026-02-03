import { useState, useEffect } from 'react';
import { Cpu, Power,Wifi } from 'lucide-react';
import { db as database } from '../Firebase';
import { ref, onValue, set } from 'firebase/database';

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

  useEffect(() => {
    // Listen to ROOT level – your data is flat at root
    const rootRef = ref(database, '/');

    const unsubscribe = onValue(rootRef, (snapshot) => {
      setLoading(false);
      const data = snapshot.val();

      if (!data) {
        setDevices([]);
        return;
      }

      // Only take direct children that are numbers (0/1) → treat as devices
      const loadedDevices: Device[] = Object.entries(data)
        .filter(([_, value]) => typeof value === 'number') // only 0/1 values
        .map(([key, value]: [string, any]) => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(), // Fan → Fan, light → Light
          room: key.toLowerCase().includes('fan') ? 'Bedroom' : 'Living Room', // simple fallback
          power: key.toLowerCase().includes('fan') ? 75 : 60,
          units: key.toLowerCase().includes('fan') ? 1.8 : 0.4,
          status: 'online', // assume always online for now
          isOn: value === 1,
        }));

      setDevices(loadedDevices);
      setError(null);
    }, (err) => {
      console.error("Firebase listener error:", err);
      setError("Cannot connect to Firebase Realtime Database");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle ON/OFF → write 1 or 0 directly to the key
  const toggleDevice = (deviceId: string, currentIsOn: boolean) => {
    const newValue = currentIsOn ? 0 : 1;
    const deviceRef = ref(database, deviceId); // e.g. ref(..., 'Fan') or ref(..., 'Light')

    set(deviceRef, newValue)
      .then(() => {
        console.log(`${deviceId} updated to ${newValue}`);
      })
      .catch((err) => {
        console.error("Write failed:", err);
        setError("Failed to control device – check rules or connection");
      });
  };

 
  // const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeDevices = devices.filter(d => d.isOn).length;
  const totalConsumption = devices
    .reduce((sum, d) => sum + (d.isOn ? d.units : 0), 0)
    .toFixed(1);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading devices...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-blue-600" />
            Connected Devices
          </h1>
          <p className="text-gray-600 text-lg">Control your home appliances</p>
        </div>

        {/* Stats cards – same as before */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Devices</p>
            <p className="text-2xl font-bold">2</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Online</p>
            <p className="text-2xl font-bold">2</p>
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

        {devices.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No devices found. Add Fan or Light in Firebase console.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map(device => (
              <div key={device.id} className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.room}</p>
                  </div>
                  <Wifi className="w-6 h-6 text-green-500" />
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Power</span>
                    <span className="font-medium">{device.power} W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consumption</span>
                    <span className="font-medium">{device.units} kWh</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDevice(device.id, device.isOn)}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition ${
                    device.isOn
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  {device.isOn ? 'Turn OFF' : 'Turn ON'}
                </button>

                <div className="mt-4 flex justify-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    <Power className="w-4 h-4" />
                    {device.isOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}