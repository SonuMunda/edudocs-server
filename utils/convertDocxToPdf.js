const CloudConvert = require("cloudconvert");

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

const convertDocxToPdf = async (file, res) => {
  try {
    console.log("File object:", file);

    if (!file || !file.buffer) {
      console.error("Error: File buffer is undefined.");
      return res.status(400).send("File buffer is invalid.");
    }

    // Create the job
    let job = await cloudConvert.jobs.create({
      tasks: {
        "import-my-file": {
          operation: "import/upload",
          filename: file.originalname || "document.docx"
        },
        "convert-my-file": {
          operation: "convert",
          input: "import-my-file",
          output_format: "pdf",
        },
        "export-my-file": {
          operation: "export/url",
          input: "convert-my-file",
        },
      },
    });

    // Get the upload task
    const uploadTask = job.tasks.filter(
      task => task.name === "import-my-file"
    )[0];
    
    // Upload the file
    await cloudConvert.tasks.upload(
      uploadTask, 
      file.buffer,
      file.originalname || "document.docx"
    );

    // Wait for job completion
    job = await cloudConvert.jobs.wait(job.id);

    if (job.status === "error") {
      console.error("Conversion failed:", job.message);
      return res.status(500).send("Conversion failed. Please try again later.");
    }

    // Get the export task
    const exportTask = job.tasks.filter(
      task => task.operation === "export/url" && task.status === "finished"
    )[0];
    
    if (!exportTask || !exportTask.result || !exportTask.result.files || !exportTask.result.files[0]) {
      throw new Error("No export files found");
    }

    const downloadUrl = exportTask.result.files[0].url;
    return downloadUrl;
  } catch (error) {
    console.error("Error converting DOCX to PDF:", error);
    return res.status(500).send("Internal server error.");
  }
};


module.exports = convertDocxToPdf;