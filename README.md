# GreenCart Logistics Simulation & Management Platform

## 1. Project Overview & Purpose

GreenCart Logistics is an internal tool designed for an eco-friendly delivery company to simulate delivery operations, analyze key performance indicators (KPIs), and manage core data entities such as drivers, routes, and orders. The platform enables:

- Running delivery simulations based on configurable parameters.
- Viewing summarized KPIs like total profit, efficiency, on-time delivery rates, and fuel costs.
- Managing operational data through CRUD interfaces for Drivers, Routes, and Orders.
- Tracking simulation history with detailed KPI results.

This project aims to optimize logistics operations and enhance decision-making by providing actionable insights and real-time data management.

---

## 2. Setup Steps

- Clone the repository
- Install dependencies for frontend and backend
- Configure environment variables
- Run both frontend and backend servers locally
- Access the application via browser

---

## 3. Tech Stack Used

- **Frontend:** React.js, Tailwind CSS, Fetch API
- **Backend:** Node.js, Express.js, MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Visualization:** Chart.js (or any other charting library)
- **Deployment:** (Vercel and Render)

---

## 4. Setup Instructions

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend

Install dependencies:

bash
Copy
Edit
npm install
Start the development server:

bash
Copy
Edit
npm start
Open your browser at http://localhost:3000

Backend
Navigate to the backend folder:

bash
Copy
Edit
cd backend
Install dependencies:

bash
Copy
Edit
npm install
Start the server:

bash
Copy
Edit
npm run dev
Backend API will run on http://localhost:5000

5. Environment Variables
Create a .env file in the backend root with the following variables:

env
Copy
Edit
MONGO_URI=               # MongoDB connection string
JWT_SECRET=              # Secret key for JWT token signing
PORT=                    # Port number for backend server (default 5000)
(Additional variables if applicable)

6. Deployment Instructions
Ensure environment variables are set on your hosting platform.

Build frontend for production:

bash
Copy
Edit
npm run build
Serve frontend build via static hosting or integrate with backend.

7. API Documentation
Swagger / OpenAPI Spec
You can find the API specification in the docs/swagger.yaml file.
Import it into Swagger UI or Postman for interactive exploration.

Postman Collection
Import the Postman collection from:
docs/GreenCart-Logistics.postman_collection.json

Example Requests & Responses
Run Simulation
Endpoint: POST /api/simulation/run

Headers:

pgsql
Copy
Edit
Content-Type: application/json  
Authorization: Bearer <JWT_TOKEN>
Body:

json
Copy
Edit
{
  "availableDrivers": 5,
  "startTime": "08:00",
  "maxHoursPerDriver": 8
}
Success Response:

json
Copy
Edit
{
  "message": "Simulation completed",
  "KPIs": {
    "totalOrders": 100,
    "totalProfit": 50000,
    "efficiencyScore": 85,
    "onTimeDeliveries": 80,
    "lateDeliveries": 20,
    "fuelCost": 7000
  },
  "simulationId": "64f8e9d9c5a33c8d6a47c12f"
}
Get Simulation History
Endpoint: GET /api/simulation/history

Headers:

makefile
Copy
Edit
Authorization: Bearer <JWT_TOKEN>
Success Response:

json
Copy
Edit
[
  {
    "_id": "64f8e9d9c5a33c8d6a47c12f",
    "manager": "64f8e88ec5a33c8d6a47c120",
    "results": {...KPIs...},
    "createdAt": "2025-08-13T10:00:00.000Z"
  },
  ...
]
CRUD Drivers Example
GET /api/drivers - Get all drivers

POST /api/drivers - Create new driver

PUT /api/drivers/:id - Update driver

DELETE /api/drivers/:id - Delete driver

(Similar pattern applies for Routes and Orders)

For detailed API specs, please refer to the Swagger/OpenAPI file or Postman collection.

If you have any questions or issues during setup, feel free to open an issue or contact the maintainer.

© 2025 GreenCart Logistics