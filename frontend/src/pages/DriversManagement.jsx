import React, { useEffect, useState } from "react";

export default function DriversManagement() {
  const token = localStorage.getItem("token");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    name: "",
    shift_hours: "",
    past_week_hours: "",
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load drivers");
      setDrivers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ id: null, name: "", shift_hours: "", past_week_hours: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      name: form.name,
      shift_hours: Number(form.shift_hours),
      past_week_hours: form.past_week_hours
        .split(",")
        .map((h) => Number(h.trim()))
        .filter((h) => !isNaN(h)),
    };

    try {
      let res;
      if (form.id) {
        res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/drivers/${form.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/drivers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save driver");
      resetForm();
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (driver) => {
    setForm({
      id: driver._id,
      name: driver.name,
      shift_hours: driver.shift_hours,
      past_week_hours: driver.past_week_hours.join(", "),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/drivers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete driver");
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Drivers Management</h1>
                <p className="text-gray-500 mt-1">Manage your delivery drivers and their schedules</p>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add New Driver
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Driver Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift Hours</label>
                  <input
                    type="number"
                    name="shift_hours"
                    value={form.shift_hours}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Past Week Hours (comma separated)
                  </label>
                  <input
                    name="past_week_hours"
                    value={form.past_week_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 8, 8, 8, 8, 8, 0, 0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {form.id ? 'Update Driver' : 'Add Driver'}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Past Week Hours</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                          No drivers found. Add your first driver to get started.
                        </td>
                      </tr>
                    ) : (
                      drivers.map((driver) => (
                        <tr key={driver._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {driver.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {driver.shift_hours} hours
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {driver.past_week_hours.join(", ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(driver)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(driver._id)}
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
