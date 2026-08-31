# School Gate Monitoring System

A simple web-based QR attendance system developed for **Dalandanan National High School – Valenzuela City**.

The system allows students or personnel to scan their QR code using a mobile phone or computer camera. The scanned code can then be recorded as **Time In** or **Time Out**. Attendance records are automatically saved to Google Sheets.

## Features

- 📱 Works on mobile phones and desktop computers
- 📷 Uses the device camera to scan QR codes
- 🔐 No mobile application installation required
- 🟢 Records Time In
- 🔴 Records Time Out
- 🔄 The same QR code can be scanned multiple times
- 📊 Automatically saves records to Google Sheets
- 🌐 Hosted using GitHub Pages

## How It Works

The system uses three main components:

```text
User
  ↓
GitHub Pages Web App
  ↓
QR Code Scanner
  ↓
Google Apps Script
  ↓
Google Sheets