import { useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

function App() {
  const [activePage, setActivePage] = useState("search");
  const [namePrefix, setNamePrefix] = useState("");
  const [prefixResults, setPrefixResults] = useState([]);
  const [idQuery, setIdQuery] = useState("");
  const [rangeLow, setRangeLow] = useState("");
  const [rangeHigh, setRangeHigh] = useState("");
  const [rangeResults, setRangeResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [allPatients, setAllPatients] = useState([]);
  const [allPatientsMessage, setAllPatientsMessage] = useState("");
  const [newPatient, setNewPatient] = useState({
    id: "",
    name: "",
    age: "",
    disease: "",
    city: "",
  });

  const suggestions = useMemo(
    () => prefixResults.slice(0, 8),
    [prefixResults],
  );

  const fetchByPrefix = async (prefixValue) => {
    if (!prefixValue.trim()) {
      setPrefixResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/searchByPrefix/${encodeURIComponent(prefixValue)}`,
      );
      const data = await response.json();
      setPrefixResults(Array.isArray(data) ? data : []);
    } catch (error) {
      setSearchMessage("Could not fetch prefix suggestions.");
    }
  };

  const handleNameChange = async (event) => {
    const nextPrefix = event.target.value;
    setNamePrefix(nextPrefix);
    setSearchMessage("");
    await fetchByPrefix(nextPrefix);
  };

  const handleIdSearch = async () => {
    if (!idQuery.trim()) {
      setSearchMessage("Enter an ID to search.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/searchById/${encodeURIComponent(idQuery)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setSelectedPatient(null);
        setSearchMessage(data.error || "Patient not found.");
        return;
      }

      setSelectedPatient(data);
      setSearchMessage("");
    } catch (error) {
      setSearchMessage("ID search failed.");
    }
  };

  const handleRangeSearch = async () => {
    if (!rangeLow.trim() || !rangeHigh.trim()) {
      setSearchMessage("Enter both low and high ID values.");
      setRangeResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/rangeQuery/${encodeURIComponent(rangeLow)}/${encodeURIComponent(rangeHigh)}`,
      );
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setSearchMessage("Range search failed.");
        setRangeResults([]);
        return;
      }

      setRangeResults(data);
      setSearchMessage(
        data.length > 0
          ? `Found ${data.length} patient(s) in the selected ID range.`
          : "No patients found in this ID range.",
      );
    } catch (error) {
      setSearchMessage("Range search failed.");
      setRangeResults([]);
    }
  };

  const handleAddPatient = async (event) => {
    event.preventDefault();
    setAddMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/addPatient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      const data = await response.json();
      if (!response.ok) {
        setAddMessage(data.error || "Unable to add patient.");
        return;
      }

      setAddMessage("Patient added successfully.");
      setNewPatient({ id: "", name: "", age: "", disease: "", city: "" });
      setSelectedPatient(data);
      if (namePrefix.trim()) {
        await fetchByPrefix(namePrefix);
      }
    } catch (error) {
      setAddMessage("Add patient request failed.");
    }
  };

  const onFormFieldChange = (event) => {
    const { name, value } = event.target;
    setNewPatient((prev) => ({ ...prev, [name]: value }));
  };

  const fetchAllPatients = async () => {
    setAllPatientsMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setAllPatientsMessage("Unable to load patients.");
        return;
      }
      setAllPatients(data);
    } catch (error) {
      setAllPatientsMessage("Unable to load patients.");
    }
  };

  return (
    <main className="app-container">
      <header className="hero">
        <p className="hero-tag">Trie + BST Prototype</p>
        <h1>Multi-Index Medical Search System</h1>
        <p className="hero-subtitle">
          Fast prefix-based name search and efficient ID lookup for patient
          records.
        </p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={activePage === "search" ? "tab active" : "tab"}
          onClick={() => setActivePage("search")}
        >
          Search Patients
        </button>
        <button
          type="button"
          className={activePage === "add" ? "tab active" : "tab"}
          onClick={() => setActivePage("add")}
        >
          Add New Patient
        </button>
        <button
          type="button"
          className={activePage === "all" ? "tab active" : "tab"}
          onClick={async () => {
            setActivePage("all");
            await fetchAllPatients();
          }}
        >
          All Patients
        </button>
      </nav>

      {activePage === "search" && (
        <section className="page-layout">
          <section className="panel">
            <h2>Name Search (Trie Prefix)</h2>
            <input
              type="text"
              value={namePrefix}
              onChange={handleNameChange}
              placeholder="Type patient name prefix"
            />
            <ul className="suggestions">
              {suggestions.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSearchMessage("");
                    }}
                  >
                    <span>{patient.name}</span>
                    <span className="suggestion-id">ID: {patient.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>ID Search (BST Exact Match)</h2>
            <div className="row">
              <input
                type="number"
                value={idQuery}
                onChange={(event) => setIdQuery(event.target.value)}
                placeholder="Enter patient ID"
              />
              <button type="button" onClick={handleIdSearch}>
                Search
              </button>
            </div>
          </section>

          <section className="panel">
            <h2>ID Range Search (BST Range Query)</h2>
            <div className="row">
              <input
                type="number"
                value={rangeLow}
                onChange={(event) => setRangeLow(event.target.value)}
                placeholder="Low ID"
              />
              <input
                type="number"
                value={rangeHigh}
                onChange={(event) => setRangeHigh(event.target.value)}
                placeholder="High ID"
              />
              <button type="button" onClick={handleRangeSearch}>
                Search Range
              </button>
            </div>
          </section>

          {searchMessage && <p className="message">{searchMessage}</p>}

          {selectedPatient && (
            <section className="panel patient-card">
              <h2>Selected Patient</h2>
              <div className="patient-grid">
                <p>
                  <strong>ID:</strong> {selectedPatient.id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedPatient.name}
                </p>
                <p>
                  <strong>Age:</strong> {selectedPatient.age}
                </p>
                <p>
                  <strong>Disease:</strong> {selectedPatient.disease}
                </p>
                <p>
                  <strong>City:</strong> {selectedPatient.city}
                </p>
              </div>
            </section>
          )}

          {rangeResults.length > 0 && (
            <section className="panel">
              <h2>Range Search Results</h2>
              <div className="table-wrapper">
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Disease</th>
                      <th>City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangeResults.map((patient) => (
                      <tr key={`range-${patient.id}`}>
                        <td>{patient.id}</td>
                        <td>{patient.name}</td>
                        <td>{patient.age}</td>
                        <td>{patient.disease}</td>
                        <td>{patient.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
      )}

      {activePage === "add" && (
        <section className="page-layout">
          <section className="panel">
            <h2>Add New Patient</h2>
            <form onSubmit={handleAddPatient} className="form-grid">
              <input
                name="id"
                type="number"
                placeholder="ID"
                value={newPatient.id}
                onChange={onFormFieldChange}
                required
              />
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={newPatient.name}
                onChange={onFormFieldChange}
                required
              />
              <input
                name="age"
                type="number"
                placeholder="Age"
                value={newPatient.age}
                onChange={onFormFieldChange}
                required
              />
              <input
                name="disease"
                type="text"
                placeholder="Disease"
                value={newPatient.disease}
                onChange={onFormFieldChange}
                required
              />
              <input
                name="city"
                type="text"
                placeholder="City"
                value={newPatient.city}
                onChange={onFormFieldChange}
                required
              />
              <button type="submit">Add Patient</button>
            </form>
          </section>

          {addMessage && <p className="message">{addMessage}</p>}
        </section>
      )}

      {activePage === "all" && (
        <section className="page-layout">
          <section className="panel">
            <div className="all-header">
              <h2>All Patients</h2>
              <button type="button" onClick={fetchAllPatients}>
                Refresh List
              </button>
            </div>

            {allPatientsMessage && <p className="message">{allPatientsMessage}</p>}

            {!allPatientsMessage && allPatients.length === 0 && (
              <p className="empty-text">No patients available.</p>
            )}

            {allPatients.length > 0 && (
              <div className="table-wrapper">
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Disease</th>
                      <th>City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td>{patient.id}</td>
                        <td>{patient.name}</td>
                        <td>{patient.age}</td>
                        <td>{patient.disease}</td>
                        <td>{patient.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}

export default App;
