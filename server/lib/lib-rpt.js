const exceljs = require("exceljs"); // to Excel
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const libShared = require("./lib-shared");
const currentWorkingDirectory = process.cwd();

const tempDir = path.join(currentWorkingDirectory, "temp");
const tempDir2 = path.join(currentWorkingDirectory, "../", "temp");

// Create the directory if it doesn't exist
try {
  if (!fs.existsSync(tempDir) || !fs.existsSync(tempDir2)) {
    //console.log("Directory does not exist, creating...");

    // Create the directory recursively (including any parent directories if needed)
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir2, { recursive: true });
    //console.log("Directory created successfully");
  } else {
    //console.log("Directory already exists.");
  }
} catch (error) {
  // Log error if directory creation fails
  console.error("Error creating directory:", error);
}

function libRpt() {}

libRpt.interface = function () {
  (this.workBook = null), (this.workSheet = null);
};

// Default value
libRpt.rptContentObj = function () {
  (this.excel_field = null),
    (this.db_field = null),           // Database Field Name
    (this.excel_field_name = null),   // Excel show Field Name
    (this.fmt = null),                // Database return data type
    (this.excelFormat = null),        // Excel Return data type
    // Style
    // font
    (this.font_name = "Segoe UI"),
    (this.font_size = "11"),
    (this.font_color = "	#ff000000"), // ARGB code (black), can refer: https://www.myfixguide.com/color-converter/
    (this.is_bold = 0),
    (this.is_italic = 0),
    (this.underline = 0),
    (this.width = null),
    (this.height = null),
    // Alignment
    (this.hor_align = null),
    (this.ver_align = null),
    (this.wrapText = null),
    // Border Style:
    // thin
    // dotted
    // dashDot
    // hair
    // dashDotDot
    // slantDashDot
    // mediumDashed
    // mediumDashDotDot
    // mediumDashDot
    // medium
    // double
    // thick
    (this.border_top = null),
    (this.border_bottom = null),
    (this.border_left = null),
    (this.border_right = null),
    (this.bg_color = null);
};

libRpt.newPdf = function (opt, file_name, pdf_info) {
  const filePath = path.join(tempDir, file_name);
  // console.log("PDF file path: ", filePath);

  // Destructure options with default values
  const options = {
    outputPath: filePath,
    size: opt.paperSize || "A4", // Default paper size
    margins: { top: 30, left: 10, right: 10, bottom: 10 }, // Default margins
    layout: opt.pageLayout || "portrait", // Page layout, default portrait
  };

  // Create the PDF document
  const doc = new PDFDocument({
    size: options.size,
    margins: options.margins,
    layout: options.layout,
    info: pdf_info || {}, // Metadata (e.g., Title, Author)
  });

  const stream = fs.createWriteStream(options.outputPath);
  doc.pipe(stream);

  // Attach stream to the document (so savePdf can access it)
  doc._customStream = stream;

  return doc;
};

libRpt.newWorkbook = function (excel, file_name, bookInfo) {
  // construct a streaming XLSX workbook writer with styles and shared strings
  const filePath = path.join(tempDir, file_name);
  // console.log("Excel file path: ", filePath);
  const options = {
    filename: filePath,
    useStyles: true,
    useSharedStrings: true,
  };

  excel.workBooks = new exceljs.stream.xlsx.WorkbookWriter(options);

  // console.log('Excel Workbook in newWorkbook: ', excel.workBook);

  if (bookInfo) {
    excel.workBooks.subject = bookInfo.subject;
    excel.workBooks.company = bookInfo.company;
    excel.workBooks.creator = bookInfo.creator;
  }

  return excel.workBooks;
};

libRpt.saveWorkbook = function (excel) {
  return new Promise((resolve, reject) => {
    // console.log('Excel Workbook in saveWorkbook: ', excel.workBook);
    excel.workBooks
      .commit()
      .then(() => {
        resolve(); // Resolve when the file is written
      })
      .catch((err) => {
        reject(err); // Reject if there is an error
        console.error("Error writing the streamed file:", err);
      });
  });
};

libRpt.getWorksheetCount = function (excel) {
  return excel.workBooks._worksheets.length; // Get the length of the worksheets array
};

libRpt.newWorkSheet = function (excel, sheet) {
  if (!sheet) {
    sheet = "Worksheet " + (libRpt.getWorksheetCount(excel) + 1);
  }

  excel.workSheet = excel.workBooks.addWorksheet(sheet);

  // Set the page size to A4 and other settings
  excel.workSheet.pageSetup = {
    paperSize: 9, // A4 paper size (9 corresponds to A4 in Excel)
    orientation: "portrait", // Optional: Set orientation to landscape if needed
    fitToPage: true, // This will automatically scale the content to fit the page
    fitToWidth: 1, // Fit the content to one page width
    fitToHeight: 1, // Fit the content to one page height
  };

  return excel.workSheet;
};

libRpt.setHeader = function (excel, headerConfig, addBlankLine) {
  if (!excel.workSheet) {
    throw new Error("Worksheet not initialized. Call newWorksheet() first.");
  }
  // console.log(headerConfig);

  headerConfig.forEach((header) => {
    // console.log("Header: ", header);
    // console.log(header.excel_field);

    const cell = excel.workSheet.getCell(header.excel_field);
    // console.log(cell);

    cell.value = header.excel_field_name;

    // Apply styles dynamically from rptContentObj
    cell.font = {
      name: header.font_name,
      size: header.font_size,
      color: { argb: header.font_color },
      bold: header.is_bold,
      italic: header.is_italic,
      underline: header.underline,
    };

    cell.alignment = {
      horizontal: header.hor_align,
      vertical: header.ver_align,
      mergeText: header.mergeText,
      wrapText: header.wrapText,
    };

    if (header.bg_color) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: header.bg_color },
      };
    }

    // Apply border styles
    cell.border = {
      top: header.border_top ? { style: "thin" } : undefined,
      bottom: header.border_bottom ? { style: "thin" } : undefined,
      left: header.border_left ? { style: "thin" } : undefined,
      right: header.border_right ? { style: "thin" } : undefined,
    };

    const column = excel.workSheet.getColumn(cell.col); // Get the column object
    if (header.width) {
      column.width = header.width; // Set the width if defined
    }

    // **Set Number Format if it's a numeric column**
    // Number 
    // Format Type	        Example 	    Output Example
    // Currency	            "$#,##0.00"	  $1,234.56
    // Percentage	          "0.00%"	      50.00%
    // Decimal Places	      "0.00"	      1234.56
    // Thousands Separator	"#,##0"	      1,234
    // Scientific	          "0.00E+00"	  1.23E+03

    // Date Time Format
    // Format	       Example	                Output
    // Short Date	  "dd/mm/yyyy"	            20/03/2025
    // Long Date	  "dddd, dd mmmm yyyy"	    Thursday, 20 March 2025
    // Date & Time	"dd/mm/yyyy hh:mm AM/PM"	20/03/2025 10:30 AM
    // Time Only	  "hh:mm:ss"	              10:30:45
    // ISO Format	  "yyyy-mm-dd"	            2025-03-20
    if (header.excelFormat) {
      column.numFmt = header.excelFormat || 'General'; // Example: "0.00"
    }
  });

  if (addBlankLine) {
    excel.workSheet.addRow([]);
  }
};

// libRpt.writeDataRows = function (
//   excel,
//   headerConfig,
//   dataConfig,
//   groupByFields = [],
//   subTotalFileds = [],
//   startRow = 2
// ) {
//   if (!excel.workSheet) {
//     throw new Error("Worksheet not initialized. Call newWorksheet() first.");
//   }

//   let currentRow = startRow;
//   let lastGroupValues = {}; // Store values for grouping

//   dataConfig.forEach((dataRow) => {
//     console.log("Data Row:", dataRow);

//     const row = excel.workSheet.getRow(currentRow);

//     // Determine the background color for the current row based on odd/even
//     const bgColor = currentRow % 2 === 0 ? "FFDCE6F1" : "FFB8CCE4";

//     headerConfig.forEach((header, colIndex) => {
//       console.log("Header: ", header);
//       console.log("Col Index: ", colIndex);

//       if (header.db_field && dataRow[header.db_field] !== undefined) {
//         const cell = row.getCell(colIndex + 1); // Columns are 1-indexed in ExcelJS
//         // console.log("Cell: ", cell);

//         let cellValue = dataRow[header.db_field];
//         // console.log("Cell Value: ", cellValue);

//         // 🚀 **Check if the column is in the group-by fields**
//         if (groupByFields.includes(header.db_field)) {
//           if (lastGroupValues[header.db_field] === cellValue) {
//             // console.log("Test 1:", lastGroupValues);
//             cellValue = ""; // Hide duplicate group values
//           } else {
//             console.log("Test 2: ", lastGroupValues[header.db_field]);
//             lastGroupValues[header.db_field] = cellValue;
//           }
//         }

//         cell.value = cellValue; // Assign value (either actual or blank for grouped rows)

//         // Apply cell styles from header configuration
//         cell.font = {
//           name: header.font_name,
//           size: header.font_size,
//           color: { argb: header.font_color },
//           bold: header.is_bold,
//           italic: header.is_italic,
//           underline: header.underline,
//         };

//         cell.alignment = {
//           horizontal: header.hor_align,
//           vertical: header.ver_align,
//           mergeText: header.mergeText,
//           wrapText: header.wrapText,
//         };

//         // Apply background color based on row's parity (odd/even)
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: bgColor },
//         };
//       }
//     });
//     console.log(currentRow);
//     currentRow++; // Move to the next row
//   });

//   // Count Total record of report (use currentRow - startRow)
//   const totalRecords = currentRow - startRow;
//   excel.workSheet.addRow([]);
//   excel.workSheet.addRow(["Total Records:", totalRecords]);
// };

/**
 * Writes grouped data with subtotal rows into an Excel worksheet.
 * @param {Object} excel - The Excel workbook object containing the worksheet.
 * @param {Array} headerConfig - Array of column headers.
 * @param {Array} dataConfig - Data array to be written.
 * @param {Array} groupByFields - Fields to group data by.
 * @param {Array} subTotalFields - Fields to calculate subtotals.
 * @param {Number} startRow - Starting row for writing data.
 */
libRpt.writeDataRows = async function (
  excel,
  headerConfig,
  dataConfig,
  groupByFields = [],
  subTotalFields = [],
  startRow = 2
) {
  if (!excel.workSheet) {
    throw new Error("Worksheet not initialized.");
  }

  let lastGroupValues = {};
  let rowIndex = startRow;
  let subTotalRows = [];

  const worksheet = excel.workSheet;

  // Iterate through the data rows
  for (let i = 0; i < dataConfig.length; i++) {
    const rowData = dataConfig[i];
    console.log("Row Data(write row): ", rowData);

    let isNewGroup = false;

    // Check if we have a group change
    groupByFields.forEach((field) => {
      console.log("lastgroupvalue: ", lastGroupValues[field]);
      console.log("rowdata[field]", rowData[field]);

      if (lastGroupValues[field] !== rowData[field]) {
        isNewGroup = true;
      }
    });

    // Insert subtotal row before starting a new group
    if (isNewGroup && Object.keys(lastGroupValues).length > 0) {
      insertSubtotalRow(worksheet, subTotalRows, rowIndex, subTotalFields);
      rowIndex++;
    }

    // If it's a new group, insert a group header
    if (isNewGroup) {
      const groupLabel = groupByFields
        .map((field) => rowData[field])
        .join(" - ");
      const groupRow = worksheet.addRow([groupLabel]);
      groupRow.font = { bold: true };
      rowIndex++;
    }

    // Write the actual data row
    const rowValues = headerConfig.map((col) => {
      console.log(col);
      const value = rowData[col.db_field];
      console.log("Value: ", value);

      // Get the field data type
      const valueType = col.fmt;
      console.log("Value Type:", valueType);

      if (valueType === "string") {
        return libShared.toString(value);
      } else if (valueType === "text") {
        return libShared.toText(value);
      } else if (valueType === "int") {
        return libShared.toInt(value);
      } else if (valueType === "float") {
        return libShared.toFloat(value);
      } else if (valueType === 'dt') {
        return libShared.toShortDate(value);
      } else if (valueType === 'dt2') {
        return libShared.toDateTime(value);
      }
    });

    const newRow = worksheet.addRow(rowValues);

    // **Apply alternating row colors (Zebra Striping)**
    const isOdd = rowIndex % 2 !== 0;
    newRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isOdd ? "FFDCE6F1" : "FFB8CCE4" }, // White for odd rows, Light Gray for even rows
      };
    });

    // Store values for subtotal calculation
    subTotalRows.push(newRow);
    // console.log(subTotalRows);

    // Update the last group values
    lastGroupValues = {};
    groupByFields.forEach((field) => {
      lastGroupValues[field] = rowData[field];
    });

    rowIndex++;
  }

  // Insert a final subtotal row if needed
  if (subTotalRows.length > 0) {
    insertSubtotalRow(worksheet, subTotalRows, rowIndex, subTotalFields);
  }
};

/**
 * Inserts a subtotal row in the worksheet.
 * @param {Object} worksheet - The worksheet where the row should be added.
 * @param {Array} subTotalRows - The rows used for subtotal calculations.
 * @param {Number} rowIndex - The row index where the subtotal row will be placed.
 * @param {Array} subTotalFields - The fields to sum up.
 */
function insertSubtotalRow(worksheet, subTotalRows, rowIndex, subTotalFields) {
  // console.log(subTotalRows);
  // console.log(subTotalFields);

  if (subTotalRows.length === 0) return;

  // Ensure rowSample doesn't have an extra empty item
  let rowSample = subTotalRows[0].values.slice(1); // Remove extra empty item

  // console.log("Row Sample:", rowSample); // Debugging

  let subtotalValues = rowSample.map(() => ""); // Initialize all columns as empty
  // console.log(subtotalValues);

  // Fill in subtotal fields
  subTotalFields.forEach((fieldIndex) => {
    let sum = subTotalRows.reduce(
      (acc, row) => acc + (row.getCell(fieldIndex + 1).value || 0),
      0
    );
    subtotalValues[fieldIndex] = sum; // Assign sum at the correct index
  });

  // Insert "Subtotal" label
  subtotalValues[0] = "Sub-total:";

  // Add row to the worksheet
  const subtotalRow = worksheet.addRow(subtotalValues);
  subtotalRow.font = { bold: true };
  subtotalRow.alignment = { horizontal: "right" };

  // Apply border only to subtotal fields
  subTotalFields.forEach((fieldIndex) => {
    let cell = subtotalRow.getCell(fieldIndex + 1);
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "double", color: { argb: "000000" } },
    };
  });

  subTotalRows.length = 0; // Reset for the next group
}

libRpt.appendTotal = function () {};

libRpt.writePdfLine = function (doc, style, title) {
  doc
    .font(style.bold ? "Times-Bold" : "Times-Roman") // Use Times-Bold if bold is true
    .fontSize(style.fontSize || 14)
    .fillColor(style.fontColor || "black") // Ensure color is set before text
    .text(title, {
      align: style.align || "center",
      underline: style.underline || false,
    })
    .moveDown(style.moveDownLine || 1);
};

// Write PDF Table Row
libRpt.writeTable = function (doc, dataConfig) {
  const option = {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      console.log("Row: ", row);
      console.log("Index Column: ", indexColumn);
      console.log("Index Row: ", indexRow);
      console.log("Rect Row: ", rectRow);
      console.log("Rect Cell: ", rectCell);

      doc.font("Times-Roman").fontSize(14);

      if (indexRow % 2 === 0) {
        doc.addBackground(rectRow, "white", 0.15);
      } else {
        doc.addBackground(rectRow, "white", 0.15);
      }
      // indexColumn === 0 && doc.addBackground(rectRow, 'lightblue', 0.15);
    },
  };

  dataConfig.headers.forEach((header) => {
    if (!header.align) {
      header.align = "left"; // Default alignment
    }
  });

  doc.table(dataConfig, option); //{ width: doc.page.width }); // 60 = default margin (2 * 30)
  doc.moveDown();
};

libRpt.savePdf = function (doc) {
  return new Promise((resolve, reject) => {
    if (!doc._customStream) {
      return reject(new Error("No write stream found for this PDF document"));
    }

    doc._customStream.on("finish", () => {
      console.log("✅ PDF Save Completed!");
      resolve();
    });

    doc._customStream.on("error", (err) => {
      console.error("❌ Error saving PDF:", err);
      reject(err);
    });

    console.log("📢 Ending PDF document...");
    doc.end(); // Close the document (this triggers 'finish' when done)
  });
};

module.exports = libRpt;
