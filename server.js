const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_RECORDS = 10;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Validate input file
    if (!req.file || !req.file.originalname.endsWith('.csv')) {
      return res.status(400).send('Invalid file format. Please upload a CSV file.');
    }

    // Parse CSV file
    const records = [];
    const lines = req.file.buffer.toString().split('\n');

    // Skip the header and start processing from the first data row
    for (let index = 1; index < lines.length && records.length <= MAX_RECORDS; index++) {
    const line = lines[index];

    // Validate number of fields
    const fields = line.split(',');
    console.log(line);
    if (fields.length !== 7) {
      return res.status(400).json({ error: `Invalid number of columns in row ${index}.` });
    }

    const record = {
      Student_Id: parseInt(fields[0]),
      First_Name: fields[1],
      Last_Name: fields[2],
      Email: fields[3],
      Upload_Date: new Date(fields[4]),
      Title_Code: parseInt(fields[5]),
      Percentage: parseFloat(fields[6]),
    };

    // Validate data for each row
    if (!isValidRecord(record)) {
      return res.status(400).json({ error: `Invalid data in row ${index}.` });
    }

    records.push(record);
  }

    // Processed successfully
    return res.status(200).json({ success: 'File processed successfully.', records });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  });

function isValidRecord(record) {
  // Implement your validation logic here
  // For simplicity, let's assume all records are valid
  
  return true;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
