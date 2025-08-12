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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/simulation/stats', {
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
        label: 'Fuel Cost (₹)',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Delivery Analytics Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Profit Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Profit</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            ₹{stats?.totalProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.lastUpdated ? `Updated: ${new Date(stats.lastUpdated).toLocaleString()}` : ''}
          </p>
        </div>

        {/* Efficiency Score Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Efficiency Score</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats?.efficiencyScore || 0}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${stats?.efficiencyScore || 0}%` }}
            ></div>
          </div>
        </div>

        {/* On-time Deliveries Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">On-time Deliveries</h3>
          <p className="mt-2 text-3xl font-bold text-green-500">
            {stats?.onTime || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats && stats.onTime && stats.late ? 
              `${Math.round((stats.onTime / (stats.onTime + stats.late)) * 100)}% of total` : 
              '0% of total'}
          </p>
        </div>

        {/* Late Deliveries Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Late Deliveries</h3>
          <p className="mt-2 text-3xl font-bold text-red-500">
            {stats?.late || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats && stats.onTime && stats.late ? 
              `${Math.round((stats.late / (stats.onTime + stats.late)) * 100)}% of total` : 
              '0% of total'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-time vs Late Deliveries Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery Performance</h3>
          <div className="h-80">
            <Pie data={deliveryData} options={pieOptions} />
          </div>
        </div>

        {/* Fuel Cost Breakdown Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Fuel Cost Breakdown</h3>
          <div className="h-80">
            <Bar data={fuelData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
