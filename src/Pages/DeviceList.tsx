import { useState } from 'react';
import { Cpu, Power, Zap, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export default function DeviceList() {
  const [devices] = useState([
    {
      id: 1,
      name: 'Air Conditioner',
      room: 'Living Room',
      power: 1500,
      units: 12.5,
      status: 'online',
      isOn: true,
    },
    {
      id: 2,
      name: 'Refrigerator',
      room: 'Kitchen',
      power: 150,
      units: 8.2,
      status: 'online',
      isOn: true,
    },
    {
      id: 3,
      name: 'Water Heater',
      room: 'Bathroom',
      power: 2000,
      units: 15.8,
      status: 'online',
      isOn: false,
    },
    {
      id: 4,
      name: 'Washing Machine',
      room: 'Utility Room',
      power: 800,
      units: 3.4,
      status: 'offline',
      isOn: false,
    },
    {
      id: 5,
      name: 'LED TV',
      room: 'Living Room',
      power: 120,
      units: 2.1,
      status: 'online',
      isOn: true,
    },
    {
      id: 6,
      name: 'Microwave',
      room: 'Kitchen',
      power: 1000,
      units: 1.5,
      status: 'online',
      isOn: false,
    },
    {
      id: 7,
      name: 'Ceiling Fan',
      room: 'Bedroom',
      power: 75,
      units: 1.8,
      status: 'online',
      isOn: true,
    },
    {
      id: 8,
      name: 'Router',
      room: 'Office',
      power: 12,
      units: 0.3,
      status: 'online',
      isOn: true,
    },
  ]);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeDevices = devices.filter(d => d.isOn).length;
  const totalConsumption = devices.reduce((sum, d) => sum + d.units, 0).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-blue-600" />
            Connected Devices
          </h1>
          <p className="text-gray-600 text-lg">Monitor and manage your smart devices</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Wifi className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold text-gray-900">{onlineDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Power className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{totalConsumption}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Device Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {device.name}
                  </h3>
                  <p className="text-sm text-gray-500">{device.room}</p>
                </div>
                {device.status === 'online' ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Device Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Power Rating</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {device.power}W
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Consumption</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {device.units} kWh
                  </span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {device.status === 'online' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {device.status}
                </span>
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    device.isOn
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {device.isOn ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}