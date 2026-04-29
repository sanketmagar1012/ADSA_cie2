const express = require("express");
const cors = require("cors");
const patientRoutes = require("./routes/patientRoutes");
const patientIndexService = require("./services/patientIndexService");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/", patientRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await patientIndexService.initialize();
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

startServer();
