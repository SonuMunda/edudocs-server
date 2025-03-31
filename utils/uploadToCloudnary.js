const uploadToCloudinary = async (file) => {
  try {
    const responseLink = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: file.originalname,
          filename_override: file.originalname,
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error(`Error uploading file: ${error.message}`);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(file.buffer);
    });

    return responseLink;
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return null;
  }
};

export default uploadToCloudinary;
