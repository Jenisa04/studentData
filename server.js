const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_RECORDS = 10;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const expectedHeaders = [
  'Student_Id',
  'First_Name',
  'Last_Name',
  'Email',
  'Upload_Date',
  'Title_Code',
  'Percentage',
];

const isDevelopment = process.env.NODE_ENV === 'development';

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // input file
    if (!req.file || !req.file.originalname.endsWith('.csv')) {
      return res.status(400).json({ error: 'Invalid file format. Please upload a CSV file.' });
    }

    // empty file
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty.' });
    }

    //header fields checked
    const fileHeaders = req.file.buffer.toString().split('\n')[0].trim().split(',');
    console.log("File headers: ", fileHeaders);
    console.log("Expected headers: ", expectedHeaders);
    if (!arraysEqual(expectedHeaders, fileHeaders)) {
      return res.status(400).json({ error: 'Invalid header fields in the CSV file.' });
    }

    // Parse through CSV file
    const records = [];
    const validationErrors = [];
    const lines = req.file.buffer.toString().split('\n');

    for (let index = 1; index < lines.length && records.length <= MAX_RECORDS; index++) {
      const line = lines[index];

      // no. of fields checked
      const fields = line.split(',');
      if (fields.length !== 7) {
        validationErrors.push(`Invalid number of columns in row ${index}.`);
        continue;
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

      // Validating data for each row
      const recordValidation = isValidRecord(record, index);
      if (recordValidation !== true) {
        validationErrors.push(recordValidation);
        continue;
      }

      records.push(record);
    }

    // validation errors
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation errors', validationErrors });
    }

    
    // Authenticate to another API enabled backend environment
    const apiEndpoint = 'https://ucdavis-iet.com/sample-endpoint-url';

    try {
      if (isDevelopment) {
        // successful response in development
        console.log('Simulating success in development mode.');
        const fakeSuccessResponse = { success: true };
        return res.status(200).json(fakeSuccessResponse);
      } else {
        // real API request in production
        const response = await axios.post(apiEndpoint, { records });
        await sendEmail('CSV Processing Successful', 'The CSV file has been processed successfully.');
        return res.status(200).json({ success: 'File processed successfully.', records });
      }
    } catch (error) {
      if (isDevelopment) {
        // error response in development
        console.error('Simulating error in development mode.');
        const fakeErrorResponse = { error: 'Simulated error during API request.' };
        return res.status(500).json(fakeErrorResponse);
      } else {
        // real API in production error
        await sendEmail('CSV Processing Error', 'There was an error processing the CSV file.');
        return res.status(500).send('Internal Server Error');
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});

function isValidRecord(record, index) {
  if (isNaN(record.Student_Id) || record.Student_Id <= 0) {
    return `Invalid Student_Id in row ${index}.`;
  }

  if (!isValidEmail(record.Email)) {
    return `Invalid Email in row ${index}.`;
  }
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function arraysEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

async function sendEmail(subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password',
    },
  });

  const mailOptions = {
    from: 'xyz@gmail.com',
    to: 'abc@gmail.com',
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
