# GovConnect – AI-Powered Civic Issue Reporting Platform

GovConnect is a prototype civic-tech platform that allows citizens to report local infrastructure problems (potholes, broken street lights, water leaks, etc.).
The system uses **AI-powered NLP classification (HuggingFace Transformers)** to automatically categorize issues and display real-time analytics through a transparency dashboard.

The project consists of a **React frontend**, **FastAPI backend**, and **PostgreSQL database**.

**We are still working on to deploy this website and some of frontend features are still in development as this is only a prototype.**

## Features

* Submit civic issues with location tagging
* AI-based automatic classification of complaints
* Real-time community issue dashboard
* Transparency analytics page with charts
* Interactive city map with issue markers
* PostgreSQL data persistence
* FastAPI backend API
* React + Tailwind frontend UI

---

## AI Component

The system uses a **HuggingFace Zero-Shot Classification model** (`facebook/bart-large-mnli`) to determine the category of a complaint.

Example:

| Complaint                 | AI Category |
| ------------------------- | ----------- |
| Pothole on Main Road      | Roads       |
| Street light broken       | Electricity |
| Water leakage near market | Water       |

The predicted category is automatically stored in the database and used by the transparency dashboard.

---

##  Tech Stack

### Frontend

* React
* TypeScript
* TailwindCSS
* Recharts (data visualization)
* Leaflet (maps)

### Backend

* FastAPI
* SQLAlchemy
* Pydantic
* HuggingFace Transformers

### Database

* PostgreSQL
  
#  Installation Guide

## 1️⃣ Clone the Repository

git clone https://github.com/harsh7217288/govlink.git

# Backend Setup (FastAPI)

## 2️⃣ Create Virtual Environment

```
python -m venv venv
```

Activate environment

Windows:

```
venv\Scripts\activate
```

Mac/Linux:

```
source venv/bin/activate
```

---

## 3️⃣ Install Backend Dependencies

```
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic transformers torch python-multipart
```

---

## 4️⃣ Configure PostgreSQL Database

Update `database.py`:

```
DATABASE_URL = "postgresql://username:password@localhost:5432/govconnect"
```

Create database in PostgreSQL:

```
CREATE DATABASE govconnect;
```

---

## 5️⃣ Run Backend Server

```
uvicorn main:app --reload
```

API will run at:

```
http://127.0.0.1:8000
```

Swagger Docs:

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup (React)

## 6️⃣ Install Dependencies

Navigate to govlink folder:

```
cd govlink
```

Install packages:

```
npm install
```

---

## 7️⃣ Start Frontend

```
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

# 🔗 API Endpoints

| Method | Endpoint        | Description             |
| ------ | --------------- | ----------------------- |
| GET    | `/api/issues`   | Get all reported issues |
| POST   | `/api/issues`   | Submit new issue        |
| GET    | `/api/timeline` | Dashboard timeline data |

---

# 📊 Transparency Dashboard

The transparency page visualizes civic performance using:

* Reports by category
* Resolution status
* Monthly performance trends

Charts automatically update based on database entries.

---

# 🧪 Example API Request

Submit issue:

```
POST /api/issues
```

Body:

```
{
"description": "Street light broken near hospital",
"location_name": "Downtown District",
"lat": 37.7749,
"lng": -122.4194
}
```

Response:

```
{
"message": "Issue created",
"predicted_type": "Electricity"
}
```

---

# 🌍 Deployment(In Work)

 Deployment stack:

Frontend:

* Vercel

Backend:

* Render

Database:

* Neon PostgreSQL

---

# Future Scope

GovConnect will be expanded into a full AI-powered decision intelligence platform for civic governance.

1. In the final version, the system will support voice, image, and text-based issue reporting, allowing citizens to submit richer evidence for complaints.
2. Advanced AI models will perform sentiment analysis, urgency detection, and priority scoring to help leaders identify the most critical issues faster.
3. The platform will also introduce geo-tagged evidence verification, ensuring that reports are authentic and location-validated.
4. A dedicated leader decision dashboard will provide insights such as issue heatmaps, response trends, and department-wise performance. Additionally, an AI communication assistant will help generate transparent public updates automatically, while trust analytics will measure how effectively civic authorities respond to community concerns. These enhancements aim to transform GovConnect from a reporting tool into a data-driven governance and public trust platform.

# 👨‍💻 Contributors

1. Dheeraj Soni
   divine.throne0024@gmail.com
   
3. Suryansh Chandel(Leader)
   suryanshwork3456@gmail.com
   
4. Harsh Choudhary
   7217harshchoudhary@gmail.com
   
5. Agrim Gupta
   agrim.20250002@mnnit.ac.in
   
