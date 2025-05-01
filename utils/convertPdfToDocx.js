const CloudConvert = require("cloudconvert");

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

const convertPdfToDocx = async (file, res) => {
  try {
    // console.log("File object:", file);

    if (!file || !file.buffer) {
      // console.error("No file buffer received");
      return res.status(400).json({ error: "Invalid file" });
    }

    // 1. Create Job
    // console.log("Creating CloudConvert job...");
    let job;
    try {
      job = await cloudConvert.jobs.create({
        tasks: {
          "import-my-file": {
            operation: "import/upload",
            filename: file.originalname || "document.pdf",
          },
          "convert-my-file": {
            operation: "convert",
            input: "import-my-file",
            output_format: "docx",
            engine: "libreoffice",
          },
          "export-my-file": {
            operation: "export/url",
            input: "convert-my-file",
          },
        },
      });
      // console.log("Job created:", job.id);
    } catch (createError) {
      // console.error("Job creation failed:", createError);
      throw new Error("Failed to create conversion job");
    }

    // 2. Upload File
    const uploadTask = job.tasks.find((t) => t.name === "import-my-file");
    if (!uploadTask) {
      throw new Error("Upload task not found");
    }

    // console.log("Uploading file...");
    await cloudConvert.tasks.upload(
      uploadTask,
      file.buffer,
      file.originalname || "document.pdf"
    );

    // 3. Wait for Completion
    // console.log("Waiting for conversion...");
    let finishedJob;
    try {
      finishedJob = await cloudConvert.jobs.wait(job.id);
    } catch (waitError) {
      // console.error("Job wait failed:", waitError);
      throw new Error("Conversion timeout or failure");
    }

    if (finishedJob.status === "error") {
      // console.error("Conversion failed:", finishedJob.message);
      throw new Error(finishedJob.message || "Conversion failed");
    }

    // 4. Get Result
    const exportTask = finishedJob.tasks.find(
      (t) => t.operation === "export/url" && t.status === "finished"
    );

    if (!exportTask?.result?.files?.[0]?.url) {
      // console.error("Export task incomplete:", exportTask);
      throw new Error("No download URL generated");
    }

    return exportTask.result.files[0].url;
  } catch (error) {
    // console.error("Full conversion error:", error);
    if (res) {
      return res.status(500).json({
        error: error.message || "PDF to DOCX conversion failed",
      });
    }
    throw error;
  }
};

module.exports = convertPdfToDocx;
