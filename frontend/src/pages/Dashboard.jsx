import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Navigation menu items
  const navItems = [
    { name: 'Simulation', path: '/simulation', icon: '', color: 'bg-blue-100 text-blue-800' },
    { name: 'Orders', path: '/orders', icon: '', color: 'bg-green-100 text-green-800' },
    { name: 'Routes', path: '/routes', icon: '', color: 'bg-purple-100 text-purple-800' },
    { name: 'Drivers', path: '/drivers', icon: '', color: 'bg-yellow-100 text-yellow-800' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/simulation/stats`, {
          withCredentials: true
        });
        setStats(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Fuel Costs by Vehicle Type',
      },
    },
  };

  // Chart data
  const deliveryData = {
    labels: ['On Time', 'Late'],
    datasets: [
      {
        label: 'Deliveries',
        data: stats ? [stats.onTime, stats.late] : [0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const fuelData = {
    labels: stats ? Object.keys(stats.fuelCosts || {}) : [],
    datasets: [
      {
        label: 'Fuel Cost ()',
        data: stats ? Object.values(stats.fuelCosts || {}) : [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <span className={`text-2xl p-3 rounded-lg mr-4 ${item.color}`}>
                  {item.icon}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.name} Management</h3>
                  <p className="text-sm text-gray-500">Manage {item.name.toLowerCase()} data</p>
                </div>
                <svg 
                  className="w-5 h-5 ml-auto text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Dashboard Stats and Charts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Key metrics and analytics at a glance</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Delivery Status Chart */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Delivery Status</h3>
                  <div className="h-64">
                    <Pie data={deliveryData} options={pieOptions} />
                  </div>
                </div>

                {/* Fuel Costs Chart */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Fuel Costs by Vehicle Type</h3>
                  <div className="h-64">
                    <Bar data={fuelData} options={barOptions} />
                  </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 uppercase tracking-wider">Total Deliveries</h4>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalDeliveries || 0}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 uppercase tracking-wider">On Time Rate</h4>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {stats.onTimeRate ? `${Math.round(stats.onTimeRate * 100)}%` : '0%'}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-800 uppercase tracking-wider">Total Revenue</h4>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
