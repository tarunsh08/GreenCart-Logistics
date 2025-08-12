import React, { useEffect, useState } from "react";

export default function OrdersManagement() {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    order_id: "",
    value_rs: "",
    assigned_route: "",
    delivery_timestamp: "",
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/routes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load routes");
      setRoutes(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      order_id: "",
      value_rs: "",
      assigned_route: "",
      delivery_timestamp: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      order_id: form.order_id,
      value_rs: Number(form.value_rs),
      route: form.assigned_route,
      delivery_time: form.delivery_timestamp,
    };

    console.log('Request body:', JSON.stringify(body, null, 2));

    try {
      let res;
      const url = form.id 
        ? `http://localhost:3000/api/orders/${form.id}`
        : 'http://localhost:3000/api/orders';
      
      console.log(`Making ${form.id ? 'PUT' : 'POST'} request to:`, url);
      
      res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('Response status:', res.status);
      console.log('Response data:', data);
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to save order");
      }
      
      resetForm();
      fetchOrders();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    }
  };

  const handleEdit = (order) => {
    setForm({
      id: order._id,
      order_id: order.order_id,
      value_rs: order.value_rs,
      assigned_route: order.route?._id || order.route,
      delivery_timestamp: order.delivery_time?.slice(0, 16) || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete order");
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Orders Management</h1>
                <p className="text-gray-500 mt-1">Manage customer orders and delivery schedules</p>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add New Order
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                  <input
                    name="order_id"
                    value={form.order_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ORD-1001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Value (₹)</label>
                  <input
                    type="number"
                    name="value_rs"
                    value={form.value_rs}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Route</label>
                  <select
                    name="assigned_route"
                    value={form.assigned_route}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select route</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.route_id} - {route.distance_km}km ({route.traffic_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                  <input
                    type="datetime-local"
                    name="delivery_timestamp"
                    value={form.delivery_timestamp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {form.id ? 'Update Order' : 'Add Order'}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No orders found. Add your first order to get started.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(order.value_rs)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof order.route === 'object' ? order.route.route_id : order.route}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.delivery_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(order)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(order._id)}
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
