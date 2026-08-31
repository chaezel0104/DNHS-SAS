// ==========================================
// GOOGLE APPS SCRIPT URL
// ==========================================

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxAkWoTK3KdWIRYwE5EAl6y1SbFZXD8kNKjX3FWmFpnP1x8HtfL8HCQakRRvUOVW9xp/exec";


// ==========================================
// VARIABLES
// ==========================================

let scanner = null;
let scannedCode = "";
let scannerRunning = false;
let saving = false;


// ==========================================
// HTML ELEMENTS
// ==========================================

const startButton =
  document.getElementById("startCamera");

const timeInButton =
  document.getElementById("timeIn");

const timeOutButton =
  document.getElementById("timeOut");

const scannedCodeElement =
  document.getElementById("scannedCode");

const messageElement =
  document.getElementById("message");


// ==========================================
// BUTTONS
// ==========================================

startButton.addEventListener(
  "click",
  startCamera
);

timeInButton.addEventListener(
  "click",
  function () {
    saveAttendance("TIME IN");
  }
);

timeOutButton.addEventListener(
  "click",
  function () {
    saveAttendance("TIME OUT");
  }
);


// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

  if (scannerRunning) {
    return;
  }

  messageElement.textContent =
    "Requesting camera permission...";

  scanner =
    new Html5Qrcode("scanner");

  try {

    await scanner.start(

      {
        facingMode: "environment"
      },

      {
        fps: 10,

        qrbox: function (
          width,
          height
        ) {

          const size =
            Math.min(
              width * 0.75,
              height * 0.75,
              300
            );

          return {
            width: size,
            height: size
          };
        },

        aspectRatio: 1.0
      },

      handleScan,

      function () {
        // Ignore normal QR scanning errors.
      }
    );

    scannerRunning = true;

    startButton.disabled = true;

    messageElement.textContent =
      "Camera ready. Scan a QR code.";

  } catch (error) {

    console.error(error);

    messageElement.textContent =
      getCameraError(error);

    scanner = null;
    scannerRunning = false;
  }
}


// ==========================================
// QR CODE SCANNED
// ==========================================

function handleScan(decodedText) {

  if (saving) {
    return;
  }

  if (scannedCode !== "") {
    return;
  }

  scannedCode =
    decodedText.trim();

  scannedCodeElement.textContent =
    scannedCode;

  messageElement.textContent =
    "Choose TIME IN or TIME OUT.";

  timeInButton.disabled = false;
  timeOutButton.disabled = false;


  // Temporarily pause camera
  if (scanner) {
    scanner.pause(true);
  }
}


// ==========================================
// SAVE ATTENDANCE
// ==========================================

async function saveAttendance(action) {

  if (!scannedCode || saving) {
    return;
  }

  saving = true;

  timeInButton.disabled = true;
  timeOutButton.disabled = true;

  messageElement.textContent =
    "Saving...";

  try {

    const response =
      await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: "POST",

          body: JSON.stringify({
            code: scannedCode,
            action: action
          })
        }
      );

    const result =
      await response.json();

    if (!result.success) {

      throw new Error(
        result.message ||
        "Unable to save attendance."
      );
    }

    messageElement.textContent =
      result.action +
      " recorded at " +
      result.time;

    scannedCode = "";

    timeInButton.disabled = true;
    timeOutButton.disabled = true;


    // Prepare for next scan
    setTimeout(
      resumeScanning,
      1200
    );

  } catch (error) {

    console.error(error);

    messageElement.textContent =
      "Could not save attendance.";

    timeInButton.disabled = false;
    timeOutButton.disabled = false;

    saving = false;

    if (scanner) {
      scanner.resume();
    }
  }
}


// ==========================================
// RESUME SCANNING
// ==========================================

function resumeScanning() {

  scannedCodeElement.textContent =
    "—";

  messageElement.textContent =
    "Ready for next scan.";

  saving = false;

  if (scanner) {
    scanner.resume();
  }
}


// ==========================================
// CAMERA ERROR MESSAGE
// ==========================================

function getCameraError(error) {

  const text =
    String(error || "")
      .toLowerCase();

  if (
    text.includes("permission") ||
    text.includes("notallowed")
  ) {

    return "Camera permission was denied. Please allow camera access in Chrome.";
  }

  if (
    text.includes("notfound") ||
    text.includes("no camera")
  ) {

    return "No camera was found on this device.";
  }

  if (
    text.includes("secure") ||
    !window.isSecureContext
  ) {

    return "Camera requires HTTPS. Please use your GitHub Pages address.";
  }

  return "Could not start the camera. Please check Chrome camera permission.";
}
