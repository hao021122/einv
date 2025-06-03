const fs = require('fs');
const path = require('path');
const libShared = require('./lib-shared');
const currentWorkingDirectory = process.cwd();

// Create a log directory if it doesn't exist
const logDir = path.join(currentWorkingDirectory, 'log');
const printerLog = path.join(currentWorkingDirectory, 'app/printer-service/', 'printer-service-log');

// Create the directory if it doesn't exist
try {
  if (!fs.existsSync(printerLog)) {
    // Create the directory recursively (including any parent directories if needed)
    fs.mkdirSync(printerLog, { recursive: true });
    // console.log("Directory created successfully");
  } else {
    // console.log("Directory already exists.");
  }
} catch (error) {
  // Log error if directory creation fails
  console.error("Error creating directory:", error);
};

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// The actual log function (libLog)
function libLog(filename, action, message) {
    // Get current date and format it as YYYY-MM-DD
    const currentDate = new Date().toISOString().slice(0, 10); // returns "YYYY-MM-DD"

    // Create the log file path (e.g., logs/2025-01-02.txt)
    const logFilePath = path.join(logDir, `${currentDate.replace(/-/g, "")}.log`);
    
    // Create log entry with timestamp, filename, action, and message
    const logEntry = `[${libShared.toDateTime(new Date().toISOString())}] - ${filename} - ${action} - ${message}\n`;
    
    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    console.log('Log added:', logEntry); // Optional: log to console for debugging
};

// The printer log function
function libPrinterLog(filename, action, message) {
    // Get current date and format it as YYYY-MM-DD
    const currentDate = new Date().toISOString().slice(0, 10); // returns "YYYY-MM-DD"

    // Create the log file path (e.g., logs/2025-01-02.txt)
    const logFilePath = path.join(printerLog, `${currentDate.replace(/-/g, "")}.log`);
    
    // Create log entry with timestamp, filename, action, and message
    const logEntry = `printer-log-[${libShared.toDateTime(new Date().toISOString())}] - ${filename} - ${action} - ${message}\n`;
    
    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    console.log('Log added:', logEntry); // Optional: log to console for debugging
};

// Export the libLog function
module.exports = { libLog, libPrinterLog };
