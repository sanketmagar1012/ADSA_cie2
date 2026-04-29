const express = require("express");
const patientIndexService = require("../services/patientIndexService");

const router = express.Router();

router.post("/addPatient", async (req, res) => {
  try {
    const patient = await patientIndexService.addPatient(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/searchById/:id", (req, res) => {
  const patient = patientIndexService.searchById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found." });
  }

  return res.json(patient);
});

router.get("/searchByPrefix/:prefix", (req, res) => {
  const patients = patientIndexService.searchByPrefix(req.params.prefix);
  return res.json(patients);
});

router.get("/patients", (_req, res) => {
  const patients = patientIndexService.getAllPatients();
  return res.json(patients);
});

router.get("/rangeQuery/:low/:high", (req, res) => {
  const patients = patientIndexService.searchByIdRange(
    req.params.low,
    req.params.high,
  );
  return res.json(patients);
});

module.exports = router;
