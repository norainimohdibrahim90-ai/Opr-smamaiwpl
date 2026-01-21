import { OPRData, DashboardStats, UnitType } from "../types";

// =========================================================================================
// PANDUAN INTEGRASI GOOGLE APPS SCRIPT (GAS) - V6 (FINAL STABLE VERSION)
// =========================================================================================
// PENTING: SETIAP KALI ANDA TUKAR KOD SCRIPT, ANDA WAJIB BUAT 'NEW DEPLOYMENT'.
// 
// 1. Buka Google Sheet (DATABASE_OPR_SEKOLAH).
// 2. Extensions > Apps Script.
// 3. PADAM SEMUA KOD LAMA. Copy & Paste kod di bahagian BAWAH fail ini.
// 4. Tekan Save (Ikon Disket).
// 5. Tekan butang biru "Deploy" > "New deployment".
// 6. PASTIKAN:
//    - Select type: "Web app"
//    - Description: "V6 Update" (atau apa-apa)
//    - Execute as: "Me" (Email anda)
//    - Who has access: "Anyone" (Sangat Penting!)
// 7. Tekan "Deploy".
// 8. Copy "Web app URL" baru dan gantikan di bawah jika ia berubah.
// =========================================================================================

// ⚠️ PASTE URL WEB APP ANDA DI SINI ⚠️
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzR4cHHCUwgmveSHBCshCnYRc05EbgYusLwqmffrWgsIhlqgawFb_-Ew0K104NuoL8/exec";

const STORAGE_KEY = "opr_system_data_local";

export const saveReportLocal = (data: OPRData) => {
  const existingData = getStoredReports();
  const index = existingData.findIndex(d => d.id === data.id);
  let updatedData;
  if (index >= 0) {
    updatedData = [...existingData];
    updatedData[index] = data;
  } else {
    updatedData = [data, ...existingData];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
};

export const uploadReportToCloud = async (data: OPRData, pdfBase64: string): Promise<boolean> => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("GANTIKAN")) {
    alert("Sila masukkan URL Google Script yang sah dalam fail services/storageService.ts");
    saveReportLocal(data);
    return true; 
  }

  // 1. Bersihkan Base64 (Buang header data:application/pdf;base64,)
  const cleanPdfBase64 = pdfBase64.split(',')[1] || pdfBase64;
  
  // 2. Sediakan Payload
  const payload = {
      ...data,
      pdfBase64: cleanPdfBase64
  };

  // 3. Hantar menggunakan FETCH (Mode: no-cors)
  // Ini lebih stabil daripada hidden iframe untuk data besar
  try {
      await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", // Wajib untuk Google Apps Script
          headers: {
              "Content-Type": "text/plain" // Wajib text/plain untuk elak 'preflight' error
          },
          body: JSON.stringify(payload)
      });

      // Kerana mode 'no-cors', kita tidak boleh membaca response server (opaque).
      // Kita anggap berjaya jika tiada error network.
      
      saveReportLocal({...data, status: 'Submitted'});
      
      alert("STATUS PENGHANTARAN:\nData telah dihantar ke Google Script.\n\nSila semak Google Sheet & Drive anda dalam masa 30 saat.\n\nJIKA MASIH KOSONG: Masalah berpunca daripada 'Deployment'. Sila buka Apps Script, dan lakukan 'New Deployment' sekali lagi.");
      
      return true;

  } catch (error) {
      console.error("Upload Error:", error);
      alert("Ralat Rangkaian: Gagal menghubungi server Google. Sila periksa sambungan internet anda.");
      saveReportLocal(data);
      return false;
  }
};

export const getStoredReports = (): OPRData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDashboardStats = (): DashboardStats => {
  const reports = getStoredReports();
  const stats: DashboardStats = {
    totalReports: reports.length,
    byUnit: {
      [UnitType.PENTADBIRAN]: 0,
      [UnitType.KURIKULUM]: 0,
      [UnitType.KOKURIKULUM]: 0,
      [UnitType.HEM]: 0,
      [UnitType.PIBG]: 0,
    },
    recentReports: reports.slice(0, 5)
  };

  reports.forEach(report => {
    if (report.unit && stats.byUnit[report.unit] !== undefined) {
      stats.byUnit[report.unit]++;
    }
  });

  return stats;
};

export const saveReport = async (data: OPRData): Promise<boolean> => {
    saveReportLocal(data);
    return true;
};

// =========================================================================================
// 👇 COPY KOD BARU INI KE GOOGLE APPS SCRIPT (PADAM KOD LAMA) 👇
// =========================================================================================
/*
// FUNGSI 1: Handling GET Request (Untuk test di browser)
function doGet(e) {
  return ContentService.createTextOutput("SUCCESS: Script is active. Please use POST method to send data.").setMimeType(ContentService.MimeType.TEXT);
}

// FUNGSI 2: Handling POST Request (Data dari App)
function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
     return ContentService.createTextOutput("Server Busy").setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    var jsonString = "";
    
    // Priority 1: Raw Post Body (Fetch text/plain) - INI PALING PENTING
    if (e.postData && e.postData.contents) {
      jsonString = e.postData.contents;
    } 
    // Priority 2: Form Parameter (Fallback)
    else if (e.parameter && e.parameter.payload) {
      jsonString = e.parameter.payload;
    }

    if (!jsonString) {
       throw new Error("Tiada data ditemui (postData.contents kosong)");
    }

    var dataObj = JSON.parse(jsonString);

    // 2. SETUP FOLDER
    var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "SISTEM_OPR_DATABASE");
    var unitName = dataObj.unit || "Lain-Lain";
    var unitFolder = getOrCreateFolder(rootFolder, unitName);
    
    // 3. SIMPAN PDF
    var cleanTajuk = (dataObj.tajukProgram || "Program").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 30);
    var uniqueId = Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd_HHmmss");
    var fileName = "OPR_" + unitName + "_" + cleanTajuk + "_" + uniqueId + ".pdf";
    
    // Decode Base64
    var blob = Utilities.newBlob(Utilities.base64Decode(dataObj.pdfBase64), 'application/pdf', fileName);
    var file = unitFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 4. SIMPAN KE SHEET
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Rekod_OPR");
    
    // Jika sheet belum wujud, buat header baru
    if (!sheet) {
      sheet = ss.insertSheet("Rekod_OPR");
      sheet.appendRow([
        "Timestamp", 
        "Tarikh Program", 
        "Unit", 
        "Tajuk Program", 
        "Disediakan Oleh", 
        "Jawatan", 
        "Objektif", 
        "Aktiviti", 
        "Kekuatan", 
        "Kelemahan", 
        "Penambahbaikan (AI)", 
        "Refleksi (AI)", 
        "Link PDF", 
        "Link Folder"
      ]);
      sheet.setFrozenRows(1);
    }
    
    // Tambah Data Baris Baru
    sheet.appendRow([
      new Date(),           
      dataObj.tarikh,          
      dataObj.unit,
      dataObj.tajukProgram,
      dataObj.disediakanOleh,
      dataObj.jawatan,
      dataObj.objektif,       
      dataObj.aktiviti,       
      dataObj.kekuatan,       
      dataObj.kelemahan,      
      dataObj.penambahbaikan, 
      dataObj.refleksi,       
      file.getUrl(),        
      unitFolder.getUrl()   
    ]);
    
    return ContentService.createTextOutput("BERJAYA DISIMPAN").setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    // Log error ke sheet Debug_Log jika ada masalah
    try {
       var ss = SpreadsheetApp.getActiveSpreadsheet();
       var logSheet = ss.getSheetByName("Debug_Log");
       if (!logSheet) logSheet = ss.insertSheet("Debug_Log");
       logSheet.appendRow([new Date(), "ERROR: " + error.toString()]);
    } catch(e) {}

    return ContentService.createTextOutput("ERROR: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
    
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}
*/