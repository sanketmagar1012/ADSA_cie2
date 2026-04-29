const fs = require("fs/promises");
const path = require("path");
const Trie = require("../dataStructures/Trie");
const BST = require("../dataStructures/BST");

const dataFilePath = path.join(__dirname, "../../patients.json");

class PatientIndexService {
  constructor() {
    this.patients = [];
    this.trie = new Trie();
    this.bst = new BST();
  }

  async initialize() {
    await this.loadPatientsFromFile();
    this.rebuildIndexes();
  }

  async loadPatientsFromFile() {
    try {
      const fileContent = await fs.readFile(dataFilePath, "utf8");
      const parsed = JSON.parse(fileContent);
      this.patients = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        this.patients = [];
        await this.persist();
      } else {
        throw error;
      }
    }
  }

  rebuildIndexes() {
    this.trie = new Trie();
    this.bst = new BST();

    for (const patient of this.patients) {
      this.trie.insert(patient.name, patient.id);
      this.bst.insert(patient.id, patient);
    }
  }

  async persist() {
    await fs.writeFile(dataFilePath, JSON.stringify(this.patients, null, 2));
  }

  normalizePatientInput(patientData) {
    const normalized = {
      id: Number(patientData.id),
      name: String(patientData.name || "").trim(),
      age: Number(patientData.age),
      disease: String(patientData.disease || "").trim(),
      city: String(patientData.city || "").trim(),
    };

    if (
      Number.isNaN(normalized.id) ||
      Number.isNaN(normalized.age) ||
      !normalized.name ||
      !normalized.disease ||
      !normalized.city
    ) {
      throw new Error("Invalid patient data.");
    }

    return normalized;
  }

  async addPatient(patientData) {
    const patient = this.normalizePatientInput(patientData);
    const existing = this.bst.searchById(patient.id);

    if (existing) {
      throw new Error("Patient with this ID already exists.");
    }

    this.patients.push(patient);
    this.trie.insert(patient.name, patient.id);
    this.bst.insert(patient.id, patient);
    await this.persist();

    return patient;
  }

  searchById(id) {
    return this.bst.searchById(id);
  }

  searchByPrefix(prefix) {
    const ids = this.trie.searchByPrefix(prefix);
    return ids
      .map((id) => this.bst.searchById(id))
      .filter((patient) => patient !== null);
  }

  searchByIdRange(low, high) {
    return this.bst.rangeQuery(low, high);
  }

  getAllPatients() {
    return [...this.patients].sort((a, b) => Number(a.id) - Number(b.id));
  }
}

module.exports = new PatientIndexService();
