const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  homeDir: () => ipcRenderer.invoke("home-dir"),
  arch: () => ipcRenderer.invoke("arch"),
  getAllRecords: () => ipcRenderer.invoke("get-records"),
  testGetAllRecords: (location) =>
    ipcRenderer.invoke("test-get-all-records", location),
  searchDailyRecord: (sentData) =>
    ipcRenderer.invoke("search-daily-record", sentData),
  addNewRecord: (sentData) => ipcRenderer.invoke("add-new-record", sentData),
  osVersion: () => ipcRenderer.invoke("os-version"),
  test: (name) => ipcRenderer.invoke("test", name),
  updateRecord: (req) => ipcRenderer.invoke("update-record", req),
  updateExamDegrees: (req) => ipcRenderer.invoke("update-exam-degrees", req),
  getExams: (location) => ipcRenderer.invoke("get-exams", location),
  updateExam: (req) => ipcRenderer.invoke("update-exam", req),
  getExamDegrees: (req) => ipcRenderer.invoke("get-exam-degrees", req),
  getStudentDailyRecords: (req) =>
    ipcRenderer.invoke("get-student-daily-records", req),
  addExam: (req) => ipcRenderer.invoke("add-exam", req),
  deleteExam: (req) => ipcRenderer.invoke("delete-exam", req),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  getSchools: (storagePath) => ipcRenderer.invoke("get-schools", storagePath),
  addSchool: (storagePath, schoolName) =>
    ipcRenderer.invoke("add-school", { storagePath, schoolName }),
  deleteSchool: (storagePath, schoolName) =>
    ipcRenderer.invoke("delete-school", { storagePath, schoolName }),
  updateSchool: (storagePath, oldName, newName) =>
    ipcRenderer.invoke("update-school", { storagePath, oldName, newName }),
  getClasses: (storagePath, schoolName) =>
    ipcRenderer.invoke("get-classes", storagePath, schoolName),
  addClass: (storagePath, schoolName, className) =>
    ipcRenderer.invoke("add-class", { storagePath, schoolName, className }),
  deleteClass: (storagePath, schoolName, className) =>
    ipcRenderer.invoke("delete-class", { storagePath, schoolName, className }),
  updateClass: (storagePath, schoolName, oldName, newName) =>
    ipcRenderer.invoke("update-class", {
      storagePath,
      schoolName,
      oldName,
      newName,
    }),
  getDivisions: (storagePath, schoolName, className) =>
    ipcRenderer.invoke("get-divisions", storagePath, schoolName, className),
  addDivision: (storagePath, schoolName, className, divisionName) =>
    ipcRenderer.invoke("add-division", {
      storagePath,
      schoolName,
      className,
      divisionName,
    }),
  deleteDivision: (storagePath, schoolName, className, divisionName) =>
    ipcRenderer.invoke("delete-division", {
      storagePath,
      schoolName,
      className,
      divisionName,
    }),
  updateDivision: (storagePath, schoolName, className, oldName, newName) =>
    ipcRenderer.invoke("update-division", {
      storagePath,
      schoolName,
      className,
      oldName,
      newName,
    }),
  getStudents: (storagePath, schoolName, className, divisionName) =>
    ipcRenderer.invoke(
      "get-students",
      storagePath,
      schoolName,
      className,
      divisionName
    ),
  getRecord: (storagePath, schoolName, className, divisionName, requestForm) =>
    ipcRenderer.invoke(
      "get-record",
      storagePath,
      schoolName,
      className,
      divisionName,
      requestForm
    ),
  addStudent: (storagePath, schoolName, className, divisionName, student) =>
    ipcRenderer.invoke(
      "add-student",
      storagePath,
      schoolName,
      className,
      divisionName,
      student
    ),
  updateStudent: (req) => ipcRenderer.invoke("update-student", req),
  addStudentExamDegree: (req) => ipcRenderer.invoke("add-exam-degree", req),
  deleteStudent: (req) => ipcRenderer.invoke("delete-student", req),
  initDailyRecords: (storagePath, schoolName, className, divisionName) =>
    ipcRenderer.invoke(
      "init-daily-records",
      storagePath,
      schoolName,
      className,
      divisionName
    ),
  getDailyRecords: (filters) =>
    ipcRenderer.invoke("get-daily-records", filters),
  updateDailyRecords: (records) =>
    ipcRenderer.invoke("update-daily-records", records),
  getStudentRecords: (studentId, startDate, endDate) =>
    ipcRenderer.invoke("get-student-records", studentId, startDate, endDate),
  getTotalStudentData: (req) =>
    ipcRenderer.invoke("get-total-student-data", req),
});
