# Multi-Index Medical Search System (Prototype)

This project demonstrates a healthcare search system using two in-memory indexes:

- **Trie** for prefix-based patient name search
- **BST** for ID-based exact lookup and ID range queries

No database is used. Data is loaded from `backend/patients.json`.

## Project Structure

- `backend/src/dataStructures/Trie.js` - Trie implementation (`insert`, `searchByPrefix`)
- `backend/src/dataStructures/BST.js` - BST implementation (`insert`, `searchById`, `rangeQuery`)
- `backend/src/services/patientIndexService.js` - Loads JSON and updates both indexes
- `backend/src/routes/patientRoutes.js` - API routes
- `backend/src/server.js` - Express entrypoint
- `frontend/src/App.jsx` - React UI for search and add patient

## Backend APIs

- `POST /addPatient` -> add a patient and update Trie + BST
- `GET /searchById/:id` -> get patient by exact ID (BST)
- `GET /searchByPrefix/:prefix` -> get matching patients by name prefix (Trie -> BST)
- `GET /rangeQuery/:low/:high` -> optional BST range query
- `GET /health` -> health check

## Run Instructions

### 1) Start backend

```bash
cd backend
npm install
npm start
```

Backend runs at `http://localhost:5000`.

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at the Vite local URL (typically `http://localhost:5173`).

## Notes

- On backend startup, patients from `patients.json` are inserted into both indexes.
- When adding a new patient, the JSON file and both indexes are updated.
- Name suggestions in frontend are powered by the Trie prefix endpoint.
