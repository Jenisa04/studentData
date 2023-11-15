# Student Data Validation

A Node.js server application that validates student data in a .csv file.

## Installation

1. Install Node.js latest version: https://nodejs.org/en 
2. Installed express, multer, csv-parser, axios, nodemailer
    
    a. In the terminal, cd to your directory and, type 'npm install express multer csv-parser axios nodemailer'

## Usage
1. Inside the terminal, cd to your directory and run, 'node server.js'
    
    a. An output should indicate servr running on 'http://localhost:3000'.

2. In a new terminal, type 'curl -X POST -H "Content-Type: multipart/form-data" -F "file=@Sample_Test_File.csv" http://localhost:3000/upload'
    
    a. You can write your test file's name in place of 'Sample_Test_File' in the command.
    
    b. Currently, if you run directly, there would be an 'Internal server error'.
    
    c. Once the email id and password is changed, the email should be sent successfully.