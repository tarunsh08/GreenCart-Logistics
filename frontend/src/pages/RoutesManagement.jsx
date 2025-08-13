import React, { useEffect, useState } from "react";

export default function RoutesManagement() {
  const token = localStorage.getItem("token");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    route_id: "",
    distance_km: "",
    traffic_level: "Low",
    base_time_min: "",
  });

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load routes");
      }
      
      const data = await res.json();
      setRoutes(data);
      setError("");
    } catch (err) {
      console.error("Fetch routes error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      route_id: "",
      distance_km: "",
      traffic_level: "Low",
      base_time_min: "",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const routeId = form.route_id ? String(form.route_id).trim() : "";
    
    if (!routeId) {
      setError("Route ID is required");
      return;
    }
    
    if (isNaN(form.distance_km) || form.distance_km <= 0) {
      setError("Distance must be a positive number");
      return;
    }
    
    if (isNaN(form.base_time_min) || form.base_time_min <= 0) {
      setError("Base time must be a positive number");
      return;
    }

    const body = {
      route_id: routeId,  
      distance_km: parseFloat(form.distance_km),
      traffic_level: form.traffic_level,
      base_time_min: parseInt(form.base_time_min),
    };

    try {
      const url = form.id 
        ? `${import.meta.env.VITE_SERVER_URL}/api/routes/${form.id}`
        : `${import.meta.env.VITE_SERVER_URL}/api/routes`;
      
      const method = form.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to save route");
      }
      
      resetForm();
      await fetchRoutes(); // Wait for refresh to complete
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "An error occurred while saving the route");
    }
  };

  const handleEdit = (route) => {
    setForm({
      id: route._id,
      route_id: route.route_id,
      distance_km: route.distance_km.toString(),
      traffic_level: route.traffic_level,
      base_time_min: route.base_time_min.toString(),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/routes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete route");
      }
      
      await fetchRoutes(); // Wait for refresh to complete
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "An error occurred while deleting the route");
    }
  };

  const getTrafficLevelColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Routes Management</h1>
                <p className="text-gray-500 mt-1">Manage delivery routes and their configurations</p>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add New Route
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route ID</label>
                  <input
                    name="route_id"
                    value={form.route_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ROUTE-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    name="distance_km"
                    value={form.distance_km}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 15.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Level</label>
                  <select
                    name="traffic_level"
                    value={form.traffic_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Time (minutes)</label>
                  <input
                    type="number"
                    name="base_time_min"
                    value={form.base_time_min}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 45"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {form.id ? 'Update Route' : 'Add Route'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Time</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {routes.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          {loading ? "Loading..." : "No routes found. Add your first route to get started."}
                        </td>
                      </tr>
                    ) : (
                      routes.map((route) => (
                        <tr key={route._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {route.route_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {route.distance_km} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrafficLevelColor(route.traffic_level)}`}>
                              {route.traffic_level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {route.base_time_min} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(route)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(route._id)}
                              className="text-red-600 hover:text-red-900 ml-4"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}