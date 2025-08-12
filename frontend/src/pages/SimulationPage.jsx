import React, { useState } from "react";

export default function SimulationPage() {
  const [formData, setFormData] = useState({
    availableDrivers: "",
    startTime: "",
    maxHoursPerDriver: "",
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const runSimulation = async () => {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("http://localhost:3000/api/simulation/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          availableDrivers: Number(formData.availableDrivers),
          startTime: formData.startTime,
          maxHoursPerDriver: Number(formData.maxHoursPerDriver),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-semibold text-gray-800">Run Simulation</h1>
            <p className="text-gray-500 mt-1">Configure and run delivery simulation</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Drivers</label>
                <input
                  type="number"
                  name="availableDrivers"
                  value={formData.availableDrivers}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 5"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours Per Day</label>
                <input
                  type="number"
                  name="maxHoursPerDriver"
                  value={formData.maxHoursPerDriver}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 8"
                  min="1"
                  max="24"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={runSimulation}
                disabled={loading || !formData.availableDrivers || !formData.startTime || !formData.maxHoursPerDriver}
                className={`px-6 py-2.5 rounded-lg text-white font-medium ${
                  loading || !formData.availableDrivers || !formData.startTime || !formData.maxHoursPerDriver
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running...
                  </span>
                ) : 'Run Simulation'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData({ availableDrivers: "", startTime: "", maxHoursPerDriver: "" });
                  setResults(null);
                  setError("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {results && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Simulation Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">{results.totalOrders || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500">Delivered Orders</h3>
                  <p className="text-2xl font-semibold text-green-600 mt-1">{results.deliveredOrders || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500">Avg. Delivery Time</h3>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">{results.avgDeliveryTime || 0} min</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
