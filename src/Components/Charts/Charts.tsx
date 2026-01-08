import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Zap } from 'lucide-react';

export default function Charts() {
  // Sample data for last 6 months
  const data = [
    { month: 'Jul', bill: 3200, units: 420 },
    { month: 'Aug', bill: 3450, units: 445 },
    { month: 'Sep', bill: 2980, units: 395 },
    { month: 'Oct', bill: 2750, units: 365 },
    { month: 'Nov', bill: 2890, units: 380 },
    { month: 'Dec', bill: 3100, units: 410 },
  ];

  // Simple stats
  const avgBill = Math.round(data.reduce((sum, d) => sum + d.bill, 0) / data.length);
  const avgUnits = Math.round(data.reduce((sum, d) => sum + d.units, 0) / data.length);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Avg Bill</span>
              <IndianRupee className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">₹{avgBill}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Avg Units</span>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{avgUnits} kWh</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Monthly Bills</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="bill" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Units Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} kWh`} />
                <Line type="monotone" dataKey="units" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}