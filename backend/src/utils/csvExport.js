'use strict';

const { Parser } = require('json2csv');
const AppError = require('./AppError');

/**
 * Generate a CSV buffer from an array of objects.
 * @param {Array<object>} data - Array of flat objects
 * @param {Array<{ label: string, value: string }>} fields - json2csv field definitions
 * @returns {string} CSV string
 */
function generateCsv(data, fields) {
  if (!data || data.length === 0) {
    throw AppError.badRequest('No data available to export.');
  }

  try {
    const parser = new Parser({ fields, withBOM: true }); // BOM for Excel UTF-8 compatibility
    return parser.parse(data);
  } catch (err) {
    throw new AppError(`Failed to generate CSV: ${err.message}`, 500);
  }
}

/**
 * Send a CSV file as an HTTP download response.
 * @param {object} res - Express response object
 * @param {string} csv - CSV string content
 * @param {string} filename - Download filename (without .csv extension)
 */
function sendCsvResponse(res, csv, filename) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const sanitized = filename.replace(/[^a-z0-9_-]/gi, '_');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${sanitized}_${ts}.csv"`
  );
  res.status(200).send(csv);
}

module.exports = { generateCsv, sendCsvResponse };
