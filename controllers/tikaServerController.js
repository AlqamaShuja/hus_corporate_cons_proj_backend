const axios = require('axios');
const fs = require('fs').promises;
const mime = require('mime-types');

exports.extractText = async (req, res) => {
  try {
    // Check if file is provided by Multer
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file uploaded or invalid file type' });
    }

    const filePath = req.file.path;
    const fileBuffer = await fs.readFile(filePath);

    // Dynamically determine Content-Type based on file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    const TIKA_SERVER_URL = process.env.TIKA_SERVER_URL;
    // Send request to Tika server
    const response = await axios.put(`${TIKA_SERVER_URL}/tika`, fileBuffer, {
      headers: {
        Accept: 'text/plain',
        'Content-Type': contentType,
      },
      responseType: 'text',
    });

    // Clean up the uploaded file
    await fs.unlink(filePath);

    // Return Tika's response
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error processing file with Tika:', error.message);
    // Clean up file in case of error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError.message);
      }
    }
    res.status(500).json({ error: 'Failed to process file with Tika server' });
  }
};
