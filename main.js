const { app, BrowserWindow, ipcMain, dialog, screen } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const Datastore = require("nedb");
const { rejects } = require("assert");
const { type } = require("os");
const { title } = require("process");

let mainWindow;
let db = {};

function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    title: "Student Management System",
    width: width,
    height: height,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // `nodeIntegration: true` can be a security risk, consider `false` if using `preload`.
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      sandbox: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // Loading React production build

  const reactURL = path.join(__dirname, "app/build/index.html");
  // const reactURL = "http://localhost:3000";
  // mainWindow.loadURL(reactURL);

  // // Load the file using loadFile
  mainWindow.loadFile(reactURL); // Correct usage for local file paths

  // Maximizing the window to full screen
  mainWindow.maximize();

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app.whenReady().then(createMainWindow);

ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle("get-schools", async (event, storagePath) => {
  try {
    const files = await fs.promises.readdir(storagePath);
    return files.filter((file) =>
      fs.statSync(path.join(storagePath, file)).isDirectory()
    );
  } catch (error) {
    console.error("Error reading schools:", error);
    return [];
  }
});

ipcMain.handle("add-school", async (event, { storagePath, schoolName }) => {
  const schoolPath = path.join(storagePath, schoolName);
  try {
    await fs.promises.mkdir(schoolPath);
    return true;
  } catch (error) {
    console.error("Error adding school:", error);
    return false;
  }
});

ipcMain.handle("delete-school", async (event, { storagePath, schoolName }) => {
  const schoolPath = path.join(storagePath, schoolName);
  try {
    await fs.promises.rmdir(schoolPath);
    return true;
  } catch (error) {
    console.error("Error deleting school:", error);
    return false;
  }
});

ipcMain.handle(
  "update-school",
  async (event, { storagePath, oldName, newName }) => {
    const oldPath = path.join(storagePath, oldName);
    const newPath = path.join(storagePath, newName);
    try {
      await fs.promises.rename(oldPath, newPath);
      return true;
    } catch (error) {
      console.error("Error updating school:", error);
      return false;
    }
  }
);

ipcMain.handle("get-classes", async (event, storagePath, schoolName) => {
  try {
    const schoolPath = path.join(storagePath, schoolName);
    const files = await fs.promises.readdir(schoolPath);
    return files.filter((file) =>
      fs.statSync(path.join(schoolPath, file)).isDirectory()
    );
  } catch (error) {
    console.error("Error reading classes:", error);
    return [];
  }
});

ipcMain.handle(
  "add-class",
  async (event, { storagePath, schoolName, className }) => {
    const classPath = path.join(storagePath, schoolName, className);
    try {
      await fs.promises.mkdir(classPath);
      return true;
    } catch (error) {
      console.error("Error adding class:", error);
      return false;
    }
  }
);

ipcMain.handle(
  "delete-class",
  async (event, { storagePath, schoolName, className }) => {
    const classPath = path.join(storagePath, schoolName, className);
    try {
      await fs.promises.rmdir(classPath);
      return true;
    } catch (error) {
      console.error("Error deleting class:", error);
      return false;
    }
  }
);

ipcMain.handle(
  "update-class",
  async (event, { storagePath, schoolName, oldName, newName }) => {
    const oldPath = path.join(storagePath, schoolName, oldName);
    const newPath = path.join(storagePath, schoolName, newName);
    try {
      await fs.promises.rename(oldPath, newPath);
      return true;
    } catch (error) {
      console.error("Error updating class:", error);
      return false;
    }
  }
);

ipcMain.handle(
  "get-divisions",
  async (event, storagePath, schoolName, className) => {
    try {
      const classPath = path.join(storagePath, schoolName, className);
      const files = await fs.promises.readdir(classPath);
      return files.filter((file) =>
        fs.statSync(path.join(classPath, file)).isDirectory()
      );
    } catch (error) {
      console.error("Error reading divisions:", error);
      return [];
    }
  }
);

ipcMain.handle(
  "add-division",
  async (event, { storagePath, schoolName, className, divisionName }) => {
    const divisionPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName
    );
    try {
      await fs.promises.mkdir(divisionPath);
      return true;
    } catch (error) {
      console.error("Error adding division:", error);
      return false;
    }
  }
);

ipcMain.handle(
  "delete-division",
  async (event, { storagePath, schoolName, className, divisionName }) => {
    const divisionPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName
    );
    try {
      await fs.promises.rmdir(divisionPath);
      return true;
    } catch (error) {
      console.error("Error deleting division:", error);
      return false;
    }
  }
);

ipcMain.handle(
  "update-division",
  async (event, { storagePath, schoolName, className, oldName, newName }) => {
    const oldPath = path.join(storagePath, schoolName, className, oldName);
    const newPath = path.join(storagePath, schoolName, className, newName);
    try {
      await fs.promises.rename(oldPath, newPath);
      return true;
    } catch (error) {
      console.error("Error updating division:", error);
      return false;
    }
  }
);

ipcMain.handle(
  "get-students",
  async (event, storagePath, schoolName, className, divisionName) => {
    const dbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "students.db"
    );
    db[dbPath] = new Datastore({ filename: dbPath, autoload: true });
    console.log("request to get-students");

    return new Promise((resolve, reject) => {
      db[dbPath]
        .find({})
        .sort({ name: 1 })
        .exec((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        });
    });
  }
);

ipcMain.handle(
  "get-record",
  async (
    event,
    storagePath,
    schoolName,
    className,
    divisionName,
    requestForm
  ) => {
    const { term, exam, date } = requestForm;
    const dbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "dailyRecords.db"
    );
    const dbPathTwo = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "students.db"
    );
    console.log("gettin request!");
    // fs.readFile(dbPathTwo, "utf8", (err, data) => {
    //   if (err) {
    //     console.error(err);
    //     return "error occurs";
    //   }
    //   console.log(data);
    //   return data;
    // });
    db[dbPath] = new Datastore({ filename: dbPath, autoload: true });
    return new Promise((resolve, reject) => {
      db[dbPath].find({}).exec((err, docs) => {
        if (err) reject(err);
        else {
          console.log("docs: ", docs);
          resolve(docs);
        }
      });
    });
    // return new Promise((resolve, reject) => {
    //   db[dbPath].find({}).exec((err, docs) => {
    //     if (err) reject(err);
    //     else resolve("docs");
    //   });
    // });
  }
);

// ipcMain.handle(
//   "add-student",
//   async (event, storagePath, schoolName, className, divisionName, student) => {
//     const studentsDbPath = path.join(
//       storagePath,
//       schoolName,
//       className,
//       divisionName,
//       "students.db"
//     );

//     const dailyRecordsDbPath = path.join(
//       storagePath,
//       schoolName,
//       className,
//       divisionName,
//       "dailyRecords.db"
//     );
//     const exmasDbPath = path.join(
//       storagePath,
//       schoolName,
//       className,
//       divisionName,
//       "exams.db"
//     );
//     const exmasDegreesDbPath = path.join(
//       storagePath,
//       schoolName,
//       className,
//       divisionName,
//       "exam_degrees.db"
//     );
//     db[studentsDbPath] = new Datastore({
//       filename: studentsDbPath,
//       autoload: true,
//     });
//     db.exmas = new Datastore({
//       filename: exmasDbPath,
//       autoload: true,
//     });
//     db.examDegrees = new Datastore({
//       filename: exmasDegreesDbPath,
//       autoload: true,
//     });

//     // Load the daily records database
//     db[dailyRecordsDbPath] =
//       db[dailyRecordsDbPath] ||
//       new Datastore({ filename: dailyRecordsDbPath, autoload: true });

//     return new Promise((resolve, reject) => {
//       db[studentsDbPath].insert(student, (err, newStudentDoc) => {
//         if (err) reject(err);
//         else {
//           db.exmas
//             .find({})
//             .sort({ examNum: 1 })
//             .exec((err, foundExams) => {
//               if (err) {
//                 console.log(
//                   "error occurs when trying to find exams in add-student handler: ",
//                   err
//                 );
//               } else {
//                 foundExams.map((exam, index) => {
//                   const studentExamDegree = {
//                     studentId: newStudentDoc._id,
//                     studentName: newStudentDoc.name,
//                     examId: exam._id,
//                     examNum: exam.examNum,
//                     examType: exam.type,
//                     term: exam.term,
//                     examTitle: exam.title,
//                     examDate: exam.date,
//                     degree: 0,
//                   };
//                   db.examDegrees
//                     .insert(studentExamDegree)
//                     .exec((err, insertedStudentDegree) => {
//                       if (err) {
//                         console.log("error occurs when trying to insert student degree. this is have been happend in the add-student ipc handler: ", err)
//                       } else {
//                         console.log("student and all his information has been added successfully: ", newStudentDoc);
//                         resolve(newStudentDoc)
//                       }
//                     });
//                 });
//               }
//             });
//         }
//       });
//     });
//   }
// );
// mainWindow.loadURL(reactURL);

ipcMain.handle(
  "add-student",
  async (event, storagePath, schoolName, className, divisionName, student) => {
    const studentsDbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "students.db"
    );

    const examDegreesDbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "exam_degrees.db"
    );

    const examsDbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "exams.db"
    );

    db.students = new Datastore({ filename: studentsDbPath, autoload: true });
    db.exams = new Datastore({ filename: examsDbPath, autoload: true });
    db.examDegrees = new Datastore({
      filename: examDegreesDbPath,
      autoload: true,
    });

    try {
      // Insert new student
      const newStudentDoc = await insertStudent(db.students, student);

      // Fetch all exams
      const foundExams = await findExams(db.exams);

      // Insert exam degrees for the new student
      await insertExamDegrees(db.examDegrees, newStudentDoc, foundExams);

      console.log(
        "Student and all information added successfully:",
        newStudentDoc
      );
      return newStudentDoc;
    } catch (error) {
      console.error("Error in add-student handler:", error);
      throw error;
    }
  }
);

// Helper functions
function insertStudent(studentsDb, student) {
  return new Promise((resolve, reject) => {
    studentsDb.insert(student, (err, newStudentDoc) => {
      if (err) reject(err);
      else resolve(newStudentDoc);
    });
  });
}

function findExams(examsDb) {
  return new Promise((resolve, reject) => {
    examsDb
      .find({})
      .sort({ examNum: 1 })
      .exec((err, foundExams) => {
        if (err) reject(err);
        else resolve(foundExams);
      });
  });
}

function insertExamDegrees(examDegreesDb, student, exams) {
  const examDegrees = exams.map((exam) => ({
    studentId: student._id,
    studentName: student.name,
    examId: exam._id,
    examNum: exam.examNum,
    examType: exam.type,
    term: exam.term,
    examTitle: exam.title,
    examDate: exam.date,
    degree: 0,
  }));

  return new Promise((resolve, reject) => {
    examDegreesDb.insert(examDegrees, (err, insertedDegrees) => {
      if (err) reject(err);
      else resolve(insertedDegrees);
    });
  });
}

ipcMain.handle("test", async (event, name) => {
  if (db.dailyRecrods) {
    console.log("db.dailyRecord exist########################");
  } else {
    console.log("no exist !!!!!!!!!!!!!!!!!!!!!!!!!");
  }
  db.dailyRecrods = new Datastore(
    "D:/Student Data/الاصفياء/الرابع/أ/dailyRecords.db"
  );
  db.dailyRecrods.loadDatabase();
  var doctwo = {
    _id: "perfect id",
    studentId: "student14",
    studentName: "perfect",
    term: "secondTerm",
    degree: "degree1",
    date: "2023-09-12",
    quizze: 15,
    behavior: 14,
    notes: "Consistent performance, a reliable student.",
  };
  await db.dailyRecrods.insert(doctwo, function (err, newDoc) {
    if (err) {
      console.log("error !!!!!!!!!!!::", err);
    } else {
      console.log("its work> newDoc@@@@@", newDoc);
    }
    // Callback is optional
    // newDoc is the newly inserted document, including its _id
    // newDoc has no key called notToBeSaved since its value was undefined
  });
  await db.dailyRecrods.find({}, function (err, docs) {
    if (err) {
      console.log("error !!!!!!!!!!!::", err);
    } else {
      console.log("its work> found docs: @@@@@", docs);
      return docs;
    }
  });
});

ipcMain.handle("update-student", async (event, req) => {
  const { location, student } = req;
  const { studentName, studentId } = student;
  const { selectedSchool, selectedClass, selectedDivision, storagePath } =
    location;

  const studentsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "students.db"
  );
  const examDegreesDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exam_degrees.db"
  );
  const dailyRecordsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );

  db.students = new Datastore({ filename: studentsDbPath, autoload: true });
  db.examDegrees = new Datastore({
    filename: examDegreesDbPath,
    autoload: true,
  });
  db.dailyRecords = new Datastore({
    filename: dailyRecordsDbPath,
    autoload: true,
  });

  return new Promise((resolve, reject) => {
    // Update student name in the students database
    db.students.update(
      { _id: studentId },
      { $set: { name: studentName } },
      {},
      (err, numReplaced) => {
        if (err) {
          console.error("Error updating student name in students.db:", err);
          return reject(err);
        }

        // Update student name in daily records database
        db.dailyRecords.update(
          { studentId: studentId },
          { $set: { studentName: studentName } },
          { multi: true },
          (err, numReplaced) => {
            if (err) {
              console.error(
                "Error updating student name in dailyRecords.db:",
                err
              );
              return reject(err);
            }

            // Update student name in exam degrees database
            db.examDegrees.update(
              { studentId: studentId },
              { $set: { studentName: studentName } },
              { multi: true },
              (err, numReplaced) => {
                if (err) {
                  console.error(
                    "Error updating student name in examDegrees.db:",
                    err
                  );
                  return reject(err);
                }

                console.log(
                  "Student name updated successfully in all databases"
                );
                resolve(numReplaced);
              }
            );
          }
        );
      }
    );
  });
});

ipcMain.handle(
  "delete-student",
  async (
    event,
    req
    // storagePath,
    // schoolName,
    // className,
    // divisionName,
    // studentId
  ) => {
    console.log("req to delete student, ", req);

    const { location, studentId } = req;
    const { storagePath, selectedSchool, selectedClass, selectedDivision } =
      location;
    const studentsDbPath = path.join(
      storagePath,
      selectedSchool,
      selectedClass,
      selectedDivision,
      "students.db"
    );
    const examDegreesDbPath = path.join(
      storagePath,
      selectedSchool,
      selectedClass,
      selectedDivision,
      "exam_degrees.db"
    );
    const dailyRecordsDbPath = path.join(
      storagePath,
      selectedSchool,
      selectedClass,
      selectedDivision,
      "dailyRecords.db"
    );

    db.students = new Datastore({ filename: studentsDbPath, autoload: true });
    db.examDegrees = new Datastore({
      filename: examDegreesDbPath,
      autoload: true,
    });
    db.dailyRecords = new Datastore({
      filename: dailyRecordsDbPath,
      autoload: true,
    });

    return new Promise((resolve, reject) => {
      // Remove student from the students database
      db.students.remove({ _id: studentId }, {}, (err, numRemoved) => {
        if (err) {
          console.log("Error removing student:", err);
          return reject(err);
        }

        // Remove student-related data from the exam degrees database
        db.examDegrees.remove(
          { studentId: studentId },
          { multi: true },
          (err, numRemoved) => {
            if (err) {
              console.log("Error removing student exam degrees:", err);
              return reject(err);
            }

            // Remove student-related data from the daily records database
            db.dailyRecords.remove(
              { studentId: studentId },
              { multi: true },
              (err, numRemoved) => {
                if (err) {
                  console.log("Error removing student daily records:", err);
                  return reject(err);
                }

                console.log("Student and related data removed successfully");
                resolve(numRemoved);
              }
            );
          }
        );
      });
    });
  }
);

ipcMain.handle(
  "update-add-date",
  async (
    event,
    storagePath,
    schoolName,
    className,
    divisionName,
    studentId,
    updatedStudent
  ) => {
    const dbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "students.db"
    );
    db[dbPath] = new Datastore({ filename: dbPath, autoload: true });

    return new Promise((resolve, reject) => {
      db[dbPath].update(
        { _id: studentId },
        { $set: updatedStudent },
        {},
        (err, numReplaced) => {
          if (err) reject(err);
          else resolve(numReplaced);
        }
      );
    });
  }
);

ipcMain.handle("search-daily-record", async (event, sentData) => {
  console.log("sent data: ", sentData);
  const { location, selectedDate, examId, examTitle, term } = sentData;
  const { storagePath, selectedClass, selectedSchool, selectedDivision } =
    location;

  const dailyRecordsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );

  db.dailyRecords = new Datastore({
    filename: dailyRecordsDbPath,
    autoload: true,
  });

  // Format the selectedDate to ensure only the date part is stored (YYYY-MM-DD)
  const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

  return new Promise((resolve, reject) => {
    // Query based on formattedDate, degree, and term in dailyRecords.db
    db.dailyRecords.find(
      { date: formattedDate, examId: examId, term: term },
      (err, dailyRecords) => {
        if (err) reject(err);
        else resolve(dailyRecords);
      }
    );
  });
});
ipcMain.handle("add-new-record", async (event, sentData) => {
  console.log("sent data: ", sentData);
  const { location, selectedDate, examId, term, examTitle } = sentData;
  const { storagePath, selectedClass, selectedSchool, selectedDivision } =
    location;

  const dailyRecordsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );

  const studentsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "students.db"
  );

  db.dailyRecords = new Datastore({
    filename: dailyRecordsDbPath,
    autoload: true,
  });
  db.students = new Datastore({ filename: studentsDbPath, autoload: true });

  // Format the selectedDate to ensure only the date part is stored (YYYY-MM-DD)
  const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

  return new Promise((resolve, reject) => {
    // Query based on formattedDate, degree, and term in dailyRecords.db
    db.dailyRecords.find(
      { examId: examId, selectedDate: formattedDate, term: term },
      (err, dailyRecords) => {
        if (err) reject(err);

        // If records are found, return them
        if (dailyRecords && dailyRecords.length > 0) {
          console.log("filtered docs: ", dailyRecords);
          resolve(dailyRecords);
        } else {
          // No records found, proceed to insert new ones from students.db
          console.log("No records found, fetching students...");

          db.students.find({}, (err, students) => {
            if (err) {
              console.log("error in add-new-record: ", err);
              reject(err);
            }

            console.log("students found in add-new-records: ", students);

            if (students && students.length > 0) {
              // Prepare new records for each student
              const newRecords = students.map((student) => {
                const newStudentRec = {
                  studentId: student._id,
                  studentName: student.name,
                  term: term,
                  examId: examId,
                  examTitle: examTitle,
                  date: formattedDate, // Save only the date part
                  quizze: 15, // default quiz value, can be adjusted
                  behavior: 15, // default behavior value, can be adjusted
                  notes: "", // default empty notes, can be adjusted
                };

                return newStudentRec;
              });

              console.log("newRecords:  ", newRecords);

              // Insert the new records into dailyRecords.db
              db.dailyRecords.insert(newRecords, (err, insertedDocs) => {
                if (err) reject(err);
                console.log("Inserted new records: ", insertedDocs);
                resolve(insertedDocs); // Return the newly inserted records
              });
            } else {
              // No students found in students.db
              resolve([]); // Return empty if no students are found
            }
          });
        }
      }
    );
  });
});

ipcMain.handle(
  "init-daily-records",
  (event, storagePath, schoolName, className, divisionName) => {
    const dbPath = path.join(
      storagePath,
      schoolName,
      className,
      divisionName,
      "dailyRecords.db"
    );
    db = new Datastore({ filename: dbPath, autoload: true });
    console.log("Daily records database initialized");
  }
);

ipcMain.handle("get-daily-records", async (event, { date, term, degree }) => {
  return new Promise((resolve, reject) => {
    const query = {};
    if (date) query.date = date;
    if (term) query.term = term;
    if (degree) query.degree = degree;

    db.find(query, (err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle("update-daily-records", async (event, records) => {
  const updatePromises = records.map(
    (record) =>
      new Promise((resolve, reject) => {
        db.update(
          { _id: record._id },
          record,
          { upsert: true },
          (err, numReplaced, upsert) => {
            if (err) reject(err);
            else resolve({ numReplaced, upsert });
          }
        );
      })
  );

  try {
    const results = await Promise.all(updatePromises);
    return { success: true, results };
  } catch (error) {
    console.error("Error updating daily records:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "get-student-records",
  async (event, studentId, startDate, endDate) => {
    return new Promise((resolve, reject) => {
      const query = { studentId };
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }

      db.find(query)
        .sort({ date: 1 })
        .exec((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        });
    });
  }
);

ipcMain.handle("get-records", async () => {
  if (db.dailyRecrods) {
    console.log("db.dailyRecord exist########################");
  } else {
    console.log("no exist !!!!!!!!!!!!!!!!!!!!!!!!!");
  }
  db.dailyRecrods = new Datastore(
    "D:/Student Data/الاصفياء/الرابع/أ/dailyRecords.db"
  );
  db.dailyRecrods.loadDatabase();
  await db.dailyRecrods.find({}, function (err, docs) {
    if (err) {
      console.log("error !!!!!!!!!!!::", err);
    } else {
      console.log("its work> found docs: @@@@@", docs);
    }
  });

  console.log("db laaa: ", db);
  console.log("it works, yeeeaaai");
});

ipcMain.handle("get-exams", async (event, location) => {
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );

  db.exams = new Datastore({ filename: examsDbPath, autoload: true });

  return new Promise((resolve, reject) => {
    db.exams
      .find({})
      .sort({ examNum: 1 })
      .exec((err, docs) => {
        if (err) {
          console.error("Error occurred when finding exams:", err);
          reject(err);
        } else {
          console.log("Successfully found exams:", docs);
          resolve(docs);
        }
      });
  });
});

ipcMain.handle("delete-exam-new", async (event, req) => {
  const { location, examId } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );

  db.exams = new Datastore({ filename: examsDbPath, autoload: true });

  return new Promise((resolve, reject) => {
    db.exams.remove({ _id: examId }).exec((err, numRemoved) => {
      if (err) {
        console.error("Error occurred when finding exams:", err);
        reject(err);
      } else {
        console.log(
          `Successfully deleted exam with Id: ${examId}:`,
          numRemoved
        );
        resolve(numRemoved);
      }
    });
  });
});

// ipcMain.handle("add-exam-degree", async (event, req) => {
//   console.log("req to add-exam-degree: ", req);
//   const { data, location } = req;
//   const { storagePath, selectedSchool, selectedClass, selectedDivision } =
//     location;

//   if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
//     console.error("Invalid location object:", location);
//     throw new Error("Invalid location object");
//   }

//   const examDegreesDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exam_degrees.db"
//   );

//   db.examDegrees = new Datastore({
//     filename: examDegreesDbPath,
//     autoload: true,
//   });
//   return new Promise((resolve, reject) => {
//     db.examDegrees.insert(data).exec((err, insertedExamDegree) => {
//       if (err) {
//         console.log("Error occurs when trying to insert new Exam Degree", err);
//         reject(err);
//       } else {
//         console.log("successfully add new exam degree. ", insertExamDegrees);
//         resolve(insertedExamDegree);
//       }
//     });
//   });
// });

ipcMain.handle("add-exam-degree", async (event, req) => {
  console.log("Received request to add exam degree: ", req);
  const { data, location } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  const examDegreesDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exam_degrees.db"
  );

  db.examDegrees = new Datastore({
    filename: examDegreesDbPath,
    autoload: true,
  });

  return new Promise((resolve, reject) => {
    db.examDegrees.insert(data, (err, newDoc) => {
      if (err) {
        console.error("Error inserting new exam degree:", err);
        reject(err);
      } else {
        console.log("Successfully added new exam degree: ", newDoc);
        resolve(newDoc); // Ensure the inserted document is passed here
      }
    });
  });
});

ipcMain.handle("old-get-exam-degrees", async (event, req) => {
  const { location, term, examTitle } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;
  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  console.log("req: ", req);

  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );

  const examDegreesDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exam_degrees.db"
  );
  const studentsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "students.db"
  );

  db.exams = new Datastore({ filename: examsDbPath, autoload: true });

  db.examDegrees = new Datastore({
    filename: examDegreesDbPath,
    autoload: true,
  });

  db.students = new Datastore({ filename: studentsDbPath, autoload: true });

  return new Promise((resolve, reject) => {
    db.examDegrees
      .find({ term: term, examTitle: examTitle })
      // .sort({ studentName: 1 })
      .exec((err, foundExamDegrees) => {
        if (err) {
          console.error("Error occurred when finding exams:", err);
          reject(err);
        } else {
          if (foundExamDegrees.length === 0) {
            db.students
              .find({})
              .sort({ name: 1 })
              .exec((err, studentsData) => {
                if (err) {
                  console.error("Error occurred when finding students:", err);
                  reject(err);
                } else {
                  console.log(
                    "students Data from get-exam-degree found: ",
                    studentsData
                  );
                  db.exams
                    .findOne({ term: term, title: examTitle })
                    .sort({ exNum: 1 })
                    .exec((err, foundExam) => {
                      if (err) {
                        console.error(
                          "Error occurred when finding students:",
                          err
                        );
                        reject(err);
                      } else {
                        if (!foundExam) {
                          console.log(
                            `exam with term ${term} and name ${examTitle} not found! `
                          );
                          reject(
                            `exam with term ${term} and name ${examTitle} not found! `
                          );
                        }
                        console.log("found Exam $$$$$: ", foundExam);
                        const studentsDegrees = studentsData.map((s) => {
                          const studentDegree = {
                            studentId: s._id,
                            studentName: s.name,
                            examId: foundExam._id,
                            examNum: foundExam.examNum,
                            examType: foundExam.type,
                            term: foundExam.term,
                            examTitle: foundExam.title,
                            examDate: foundExam.date,
                            degree: 0,
                          };
                          return studentDegree;
                        });
                        db.examDegrees.insert(
                          studentsDegrees,
                          (err, foundExamDegrees) => {
                            if (err) {
                              console.error(
                                "Error occurred when finding students:",
                                err
                              );
                              reject(err);
                            } else {
                              console.log(
                                "new Degrees has been added successfully: ",
                                foundExamDegrees
                              );

                              resolve({ foundExamDegrees, foundExam });
                            }
                          }
                        );
                      }
                    });
                }
              });
          } else {
            db.exams
              .findOne({ term: term, title: examTitle })
              .exec((err, foundExam) => {
                if (err) {
                  console.log("error occurs when trying find exam: ", err);
                  reject(err);
                } else {
                  console.log("Degrees found successfully: ", foundExamDegrees);
                  resolve({ foundExamDegrees, foundExam });
                }
              });
          }
        }
      });
  });
});
ipcMain.handle("get-exam-degrees", async (event, req) => {
  const { location, term, examTitle } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;
  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  console.log("req: ", req);

  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );

  const examDegreesDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exam_degrees.db"
  );
  const studentsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "students.db"
  );

  db.exams = new Datastore({ filename: examsDbPath, autoload: true });

  db.examDegrees = new Datastore({
    filename: examDegreesDbPath,
    autoload: true,
  });

  db.students = new Datastore({ filename: studentsDbPath, autoload: true });

  return new Promise((resolve, reject) => {
    db.examDegrees
      .find({ term: term, examTitle: examTitle })
      .sort({ studentName: 1 })
      .exec((err, foundExamDegrees) => {
        if (err) {
          console.error("Error occurred when finding exams:", err);
          reject(err);
        } else {
          db.exams
            .findOne({ term: term, title: examTitle })
            .exec((err, foundExam) => {
              if (err) {
                console.log("error occurs when trying find exam: ", err);
                reject(err);
              } else {
                console.log("Degrees found successfully: ", foundExamDegrees);
                resolve({ foundExamDegrees, foundExam });
              }
            });
        }
      });
  });
});

ipcMain.handle("add-exam", async (event, req) => {
  const { location, term = 1, examTitle, examType } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );

  db.exams = new Datastore({ filename: examsDbPath, autoload: true });

  return new Promise((resolve, reject) => {
    db.exams.find({}, (err, docs) => {
      if (err) reject(err);
      else {
        const examsNumber = docs.length + 1;
        const today = new Date().toISOString().split("T")[0];
        const newExam = {
          examNum: examsNumber,
          title: examTitle,
          type: examType,
          term: term,
          date: today,
          degrees: [],
        };

        db.exams.insert(newExam, (err, newInsertedDoc) => {
          if (err) {
            console.error("Error occurred when finding exams:", err);
            reject(err);
          } else {
            resolve(newInsertedDoc);
          }
        });
      }
    });
  });
});

ipcMain.handle("delete-exam", async (event, data) => {
  const { location, examId } = data; // Use examId instead of examNum
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  if (!storagePath || !selectedSchool || !selectedClass || !selectedDivision) {
    console.error("Invalid location object:", location);
    throw new Error("Invalid location object");
  }

  if (!examId) {
    console.error("Invalid exam ID:", examId);
    throw new Error("Invalid exam ID");
  }

  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );

  db.exams = new Datastore({ filename: examsDbPath, autoload: true });

  return new Promise((resolve, reject) => {
    db.exams.remove({ _id: examId }, {}, (err, numRemoved) => {
      // Remove by _id
      if (err) {
        console.error("Error occurred when deleting exam:", err);
        reject(err);
      } else if (numRemoved === 0) {
        console.error("No exam found with the given ID:", examId);
        reject(new Error("No exam found with the given ID"));
      } else {
        console.log(`Successfully deleted exam with ID: ${examId}`);
        resolve(`Successfully deleted exam with ID: ${examId}`);
      }
    });
  });
});

ipcMain.handle("test-get-all-records", async (event, location) => {
  console.log("touching test-get-all-records @@@@@");
  console.log("location: ", location);
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;
  const dbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );
  db.dailyRecrods = new Datastore(dbPath);
  db.dailyRecrods.loadDatabase();

  return new Promise((resolve, reject) => {
    db.dailyRecrods.find({}, (err, docs) => {
      if (err) {
        console.log("error occur when finding dailyRecords from test-get");
        reject(err);
      } else {
        console.log("finding success in test-get: ", docs);
        resolve(docs);
      }
    });
  });
});

ipcMain.handle("update-record", async (event, req) => {
  const { location, term, examTitle, examId, selectedDate, dailyRecords } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;
  const dbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );
  db.dailyRecords = new Datastore({ filename: dbPath, autoload: true });

  return new Promise((resolve, reject) => {
    const updatePromises = dailyRecords.map((record) => {
      return new Promise((innerResolve, innerReject) => {
        db.dailyRecords.update(
          {
            studentId: record.studentId,
            term: term,
            examId: examId,
            date: selectedDate,
          },
          {
            $set: {
              quizze: record.quizze,
              behavior: record.behavior,
              notes: record.notes,
            },
          },
          { upsert: false },
          (err, numReplaced) => {
            if (err) {
              innerReject(err);
            } else if (numReplaced === 0) {
              innerResolve({
                status: "not_found",
                studentId: record.studentId,
              });
            } else {
              innerResolve({
                status: "updated",
                studentId: record.studentId,
              });
            }
          }
        );
      });
    });

    Promise.all(updatePromises)
      .then((results) => {
        const updatedRecords = results.filter(
          (r) => r.status === "updated"
        ).length;
        const notFoundRecords = results.filter((r) => r.status === "not_found");

        resolve({
          success: true,
          updatedCount: updatedRecords,
          notFoundStudents: notFoundRecords.map((r) => r.studentId),
        });
      })
      .catch((error) => {
        reject({ success: false, error: error.message });
      });
  });
});

ipcMain.handle("update-exam", async (event, req) => {
  try {
    console.log("req to udpate-exam: ", req);
    const { location, updatedExam } = req;
    const { storagePath, selectedSchool, selectedClass, selectedDivision } =
      location;

    // Constructing the exams database path
    const examsDbPath = path.join(
      storagePath,
      selectedSchool,
      selectedClass,
      selectedDivision,
      "exams.db"
    );

    // Loading the NeDB exams database
    db.exams =
      db.exams || new Datastore({ filename: examsDbPath, autoload: true });

    // Return a promise to handle the async update operation
    return new Promise((resolve, reject) => {
      db.exams.update(
        { _id: updatedExam._id }, // Query to match the exam by its ID
        { $set: updatedExam }, // Update the exam with the new data
        { returnUpdatedDocs: true }, // Option to return the updated document
        (err, numAffected, updatedExam) => {
          if (err) {
            console.error("Error when updating exam:", err);
            return reject(err);
          }

          console.log("Exam updated successfully. Updated exam:", updatedExam);
          resolve(updatedExam);
        }
      );
    });
  } catch (error) {
    console.error("Unexpected error during exam update:", error);
    throw error;
  }
});

ipcMain.handle("update-exam-degrees", async (event, req) => {
  const { location, examId, term, examTitle, examDegrees } = req;

  console.log("req from update-exam-degrees: ", req);
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;
  const dbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exam_degrees.db"
  );
  db.examDegrees = new Datastore({ filename: dbPath, autoload: true });

  return new Promise((resolve, reject) => {
    const updatePromises = examDegrees.map((degree) => {
      return new Promise((innerResolve, innerReject) => {
        db.examDegrees.update(
          {
            studentName: degree.studentName,
            examId: examId,
          },
          {
            $set: {
              degree: degree.degree,
            },
          },
          { upsert: false },
          (err, numReplaced) => {
            if (err) {
              innerReject(err);
            } else if (numReplaced === 0) {
              innerResolve({
                status: "not_found",
                degreeId: degree._id,
              });
            } else {
              innerResolve({
                status: "updated",
                degreeId: degree._id,
              });
            }
          }
        );
      });
    });

    Promise.all(updatePromises)
      .then((results) => {
        const updatedDegrees = results.filter(
          (d) => d.status === "updated"
        ).length;
        const notFoundDegrees = results.filter((d) => d.status === "not_found");

        resolve({
          success: true,
          updatedCount: updatedDegrees,
          notFoundDegrees: notFoundDegrees.map((d) => d._id),
        });
      })
      .catch((error) => {
        reject({ success: false, error: error.message });
      });
  });
});

// ipcMain.handle("get-total-student-data", async (event, req) => {
//   const { location } = req;

//   console.log("req from update-exam-degrees: ", req);
//   const { storagePath, selectedSchool, selectedClass, selectedDivision } =
//     location;
//   const studentsDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "students.db"
//   );
//   const examsDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exams.db"
//   );
//   const examDegreesDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exam_degrees.db"
//   );
//   const dailyRecordDbPth = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "dailyRecords.db"
//   );
//   db.students = new Datastore({ filename: studentsDbPath, autoload: true });
//   db.exams = db.exams || new Datastore({ filename: examsDbPath, autoload: true });
//   db.examDegrees = new Datastore({
//     filename: examDegreesDbPath,
//     autoload: true,
//   });
//   db.dailyRecords = new Datastore({
//     filename: dailyRecordDbPth,
//     autoload: true,
//   });

//   return new Promise((resolve, reject) => {
//     db.students
//       .find({})
//       .sort({ name: 1 })
//       .exec((err, foundStudents) => {
//         if (err) {
//           console.log(
//             "error occurs when trying to find students in get-total-student-data: ",
//             err
//           );
//           reject(err);
//         } else {
//           if (foundStudents.length === 0) {
//             reject("no found students");
//           } else {
//             const totalStudentData = foundStudents.map((st) => {
//               db.examDegrees
//                 .find({ studentId: st._id })
//                 .sort({ examNum: 1 })
//                 .exec((err, foundStudentExamDegrees) => {
//                   if (err) {
//                     console.log(
//                       "error occurs when trying to find student degrees in get-total-student-data: ",
//                       err
//                     );
//                     reject(err);
//                   } else {
//                     if (foundStudentExamDegrees.length === 0) {
//                       reject("no found student Degrees");
//                     } else {
//                       db.dailyRecords
//                         .find({ studentId: st._id })
//                         .sort({ date: 1 })
//                         .exec((err, foundStudentDailyRecords) => {
//                           if (err) {
//                             console.log(
//                               "error occurs when trying to find student degrees in get-total-student-data: ",
//                               err
//                             );
//                             reject(err);
//                           } else {
//                             if (foundStudentDailyRecords.length === 0) {
//                               reject("no found student DailyRecords");
//                             } else {
//                               const firstTermExamDegrees =
//                                 foundStudentExamDegrees.find(
//                                   (deg) => deg.term === 1
//                                 );
//                               const firstTermConclusion =
//                                 firstTermExamDegrees.map((ex) => {
//                                   let totalDeg = 0;
//                                   const relRec = foundStudentDailyRecords.map(
//                                     (rec) => rec.examId === ex._id
//                                   );
//                                   relRec.forEach((r) => {
//                                     totalDeg += r.degree;
//                                   });
//                                   const result = {
//                                     examId: ex._id,
//                                     examTitle: ex.title,
//                                     examNum: ex.examNum,
//                                     examType: ex.type,
//                                     totalRecordsDegree: totalDeg,
//                                   };
//                                   return result;
//                                 });
//                               const secondTermExamDegrees =
//                                 foundStudentExamDegrees.find(
//                                   (deg) => deg.term === 2
//                                 );
//                               const secondTermConclusion =
//                                 firstTermExamDegrees.map((ex) => {
//                                   let totalDeg = 0;
//                                   const relRec = foundStudentDailyRecords.map(
//                                     (rec) => rec.examId === ex._id
//                                   );
//                                   relRec.forEach((r) => {
//                                     totalDeg += r.degree;
//                                   });
//                                   const result = {
//                                     examId: ex._id,
//                                     examTitle: ex.title,
//                                     examNum: ex.examNum,
//                                     examType: ex.type,
//                                     totalRecordsDegree: totalDeg,
//                                   };
//                                   return result;
//                                 });
//                               const totStudentDegrees = {
//                                 _id: st._id,
//                                 name: st.name,
//                                 firstTerm: firstTermConclusion,
//                                 secondTerm: secondTermConclusion,
//                               };
//                               return totStudentDegrees;
//                             }
//                           }
//                         });
//                     }
//                   }
//                 });
//             });
//             console.log("successfully done yahhhhhhhhhhhh", totalStudentData);
//             resolve(totalStudentData);
//           }
//         }
//       });
//   });
// });

// ipcMain.handle("get-total-student-data", async (event, req) => {
//   const { location } = req;
//   const { storagePath, selectedSchool, selectedClass, selectedDivision } =
//     location;

//   const studentsDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "students.db"
//   );
//   const examsDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exams.db"
//   );
//   const examDegreesDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exam_degrees.db"
//   );
//   const dailyRecordDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "dailyRecords.db"
//   );

//   // Load all databases
//   db.students = new Datastore({ filename: studentsDbPath, autoload: true });
//   db.exams = db.exams || new Datastore({ filename: examsDbPath, autoload: true });
//   db.examDegrees = new Datastore({
//     filename: examDegreesDbPath,
//     autoload: true,
//   });
//   db.dailyRecords = new Datastore({
//     filename: dailyRecordDbPath,
//     autoload: true,
//   });

//   try {
//     const foundStudents = await findSortedStudents();
//     if (!foundStudents.length) throw new Error("No students found");

//     const totalStudentDataPromises = foundStudents.map(async (student) => {
//       const examDegrees = await findExamDegrees(student._id);
//       const dailyRecords = await findDailyRecords(student._id);
//       console.log(`daily records for ${student.name}`, dailyRecords);

//       const firstTermData = calculateTermData(examDegrees, dailyRecords, 1);
//       const secondTermData = calculateTermData(examDegrees, dailyRecords, 2);

//       return {
//         _id: student._id,
//         name: student.name,
//         firstTerm: firstTermData,
//         secondTerm: secondTermData,
//       };
//     });

//     const totalStudentData = await Promise.all(totalStudentDataPromises);
//     console.log("Successfully retrieved student data", totalStudentData);
//     return totalStudentData;
//   } catch (error) {
//     console.error("Error in get-total-student-data: ", error.message);
//     throw error;
//   }

//   // Helper functions for database operations
//   async function findSortedStudents() {
//     return new Promise((resolve, reject) => {
//       db.students
//         .find({})
//         .sort({ name: 1 })
//         .exec((err, students) => {
//           if (err) reject(err);
//           else resolve(students);
//         });
//     });
//   }

//   async function findExamDegrees(studentId) {
//     return new Promise((resolve, reject) => {
//       db.examDegrees
//         .find({ studentId })
//         .sort({ examNum: 1 })
//         .exec((err, degrees) => {
//           if (err) reject(err);
//           else {
//             resolve(degrees);
//           }
//         });
//     });
//   }

//   async function findDailyRecords(studentId) {
//     return new Promise((resolve, reject) => {
//       db.dailyRecords
//         .find({ studentId })
//         .sort({ date: 1 })
//         .exec((err, records) => {
//           if (err) reject(err);
//           else {
//             resolve(records);
//           }
//         });
//     });
//   }

//   // Helper function to calculate term data
//   function calculateTermData(examDegrees, dailyRecords, term) {
//     const termExamDegrees = examDegrees.filter(
//       (degree) => degree.term === term
//     );
//     let totalMonthsDegrees = 0;
//     let finalTermExam = 0;
//     let totalTermDegree = 0;
//     const monthsDegrees = termExamDegrees.map((exam) => {
//       console.log(`exam ${exam.examNum}`, exam);
//       if (exam.examType === "final") {
//         finalTermExam = exam.degree;
//         return;
//       } else {
//         let totalDegree = 0;
//         const relatedRecords = dailyRecords.filter((rec) => {
//           console.log("rec", rec);
//           if (rec.examId === exam.examId) {
//             return rec;
//           }
//         });
//         console.log("relatedRecords: ", relatedRecords);
//         relatedRecords.forEach((record) => {
//           console.log("record : :  ", record);
//           totalDegree = totalDegree + record.quizze + record.behavior;
//           console.log("totalDegree: ", totalDegree);
//         });
//         if (totalDegree && relatedRecords.length > 0) {
//           totalDegree = totalDegree / relatedRecords.length;
//         }
//         console.log("totalDegree", totalDegree);
//         const totalMonthDegree = exam.degree + totalDegree;
//         totalMonthsDegrees += totalMonthDegree;
//         return {
//           examId: exam._id,
//           examTitle: exam.examTitle,
//           examNum: exam.examNum,
//           examDegree: exam.degree,
//           examType: exam.examType,
//           monthTotal: totalMonthDegree,
//           totalRecordsDegree: totalDegree,
//         };
//       }
//     });
//     if (monthsDegrees && monthsDegrees.length > 0) {
//       totalMonthsDegrees = totalMonthsDegrees / monthsDegrees.length;
//       totalTermDegree = totalMonthsDegrees + finalTermExam;
//     }
//     return {
//       totalMonthsDegrees: totalMonthsDegrees,
//       finalTermExam,
//       totalTermDegree,
//       monthsDegrees: monthsDegrees,
//     };
//   }
// });

let xx = 0;

// ipcMain.handle("get-total-student-data", async (event, req) => {
//   const { location } = req;
//   const { storagePath, selectedSchool, selectedClass, selectedDivision } =
//     location;
//   xx += 1;

//   console.log(`req to get-total-student-data ${xx}`, req);
//   const studentsDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "students.db"
//   );
//   const examsDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exams.db"
//   );
//   const examDegreesDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "exam_degrees.db"
//   );
//   const dailyRecordDbPath = path.join(
//     storagePath,
//     selectedSchool,
//     selectedClass,
//     selectedDivision,
//     "dailyRecords.db"
//   );

//   // Load all databases
//   db.students = new Datastore({ filename: studentsDbPath, autoload: true });
//   db.exams = db.exams || new Datastore({ filename: examsDbPath, autoload: true });
//   db.examDegrees = new Datastore({
//     filename: examDegreesDbPath,
//     autoload: true,
//   });
//   db.dailyRecords = new Datastore({
//     filename: dailyRecordDbPath,
//     autoload: true,
//   });

//   try {
//     const foundStudents = await findSortedStudents();
//     if (!foundStudents.length) throw new Error("No students found");

//     const totalStudentDataPromises = foundStudents.map(async (student) => {
//       const examDegrees = await findExamDegrees(student._id);
//       const dailyRecords = await findDailyRecords(student._id);

//       const firstTermData = calculateTermData(examDegrees, dailyRecords, 1);
//       const secondTermData = calculateTermData(examDegrees, dailyRecords, 2);

//       return {
//         _id: student._id,
//         name: student.name,
//         firstTerm: firstTermData,
//         secondTerm: secondTermData,
//       };
//     });

//     const totalStudentData = await Promise.all(totalStudentDataPromises);
//     console.log("Successfully retrieved student data");
//     return totalStudentData;
//   } catch (error) {
//     console.error("Error in get-total-student-data:", error.message);
//     throw error;
//   }

//   // Helper functions for database operations
//   async function findSortedStudents() {
//     return new Promise((resolve, reject) => {
//       db.students
//         .find({})
//         .sort({ name: 1 })
//         .exec((err, students) => {
//           if (err) reject(err);
//           else resolve(students);
//         });
//     });
//   }

//   async function findExamDegrees(studentId) {
//     return new Promise((resolve, reject) => {
//       db.examDegrees
//         .find({ studentId })
//         .sort({ examNum: 1 })
//         .exec((err, degrees) => {
//           if (err) reject(err);
//           else resolve(degrees);
//         });
//     });
//   }

//   async function findDailyRecords(studentId) {
//     return new Promise((resolve, reject) => {
//       db.dailyRecords
//         .find({ studentId })
//         .sort({ date: 1 })
//         .exec((err, records) => {
//           if (err) reject(err);
//           else resolve(records);
//         });
//     });
//   }

//   function calculateTermData(examDegrees, dailyRecords, term) {
//     const termExamDegrees = examDegrees.filter(
//       (degree) => degree.term === term
//     );

//     let totalMonthsDegrees = 0;
//     let finalTermExam = 0;
//     let monthlyExamCount = 0;

//     // Get the expected number of monthly exams for this term
//     const expectedMonthlyExams = getExpectedMonthlyExams(term);

//     // Calculate monthly and final exam degrees
//     const monthsDegrees = termExamDegrees
//       .map((exam) => {
//         if (exam.examType === "final") {
//           finalTermExam = exam.degree || 0;
//           return null; // Skip adding it to monthsDegrees
//         }

//         monthlyExamCount++;

//         // Calculate total degree from daily records
//         let totalDegree = 0;
//         const relatedRecords = dailyRecords.filter(
//           (rec) => rec.examId === exam.examId
//         );

//         relatedRecords.forEach((record) => {
//           totalDegree += (record.quizze || 0) + (record.behavior || 0);
//         });

//         const avgDegree =
//           relatedRecords.length > 0 ? totalDegree / relatedRecords.length : 0;
//         const examDegree = exam.degree || 0;
//         const totalMonthDegree = examDegree + avgDegree;

//         totalMonthsDegrees += totalMonthDegree;

//         return {
//           examId: exam._id,
//           examTitle: exam.examTitle,
//           examNum: exam.examNum,
//           examDegree: examDegree,
//           examType: exam.examType,
//           monthTotal: totalMonthDegree,
//           totalRecordsDegree: avgDegree,
//         };
//       })
//       .filter(Boolean); // Remove any null values from monthsDegrees

//     // Add missing exams with "لم يمتحن" degree
//     for (let i = monthlyExamCount + 1; i <= expectedMonthlyExams; i++) {
//       monthsDegrees.push({
//         examId: `missing-exam-${i}`,
//         examTitle: `الامتحان الشهري ${i}`,
//         examNum: i,
//         examDegree: "لم يمتحن",
//         examType: "monthly",
//         monthTotal: 0,
//         totalRecordsDegree: 0,
//       });
//     }

//     // Calculate total term degree
//     const avgMonthlyDegree =
//       monthlyExamCount > 0 ? totalMonthsDegrees / monthlyExamCount : 0;
//     const totalTermDegree =
//       monthlyExamCount > 0 ? (avgMonthlyDegree + finalTermExam) / 2 : 0;

//     return {
//       totalMonthsDegrees: avgMonthlyDegree,
//       finalTermExam,
//       totalTermDegree,
//       monthsDegrees,
//     };
//   }

//   // Helper function to get the expected number of monthly exams for a term
//   async function getExpectedMonthlyExams(term) {
//     return new Promise((resolve, reject) => {
//       db.exams.find({ term: term, type: "monthly" }, (err, foundExams) => {
//         if (err) {
//           console.error("Error occurred when trying to find exams:", err);
//           reject(err);
//         } else {
//           const expectedExams = foundExams.length;
//           resolve(expectedExams);
//         }
//       });
//     });
//   }

//   // Helper function to calculate term data
//   // function calculateTermData(examDegrees, dailyRecords, term) {
//   //   const termExamDegrees = examDegrees.filter(
//   //     (degree) => degree.term === term
//   //   );

//   //   let totalMonthsDegrees = 0;
//   //   let finalTermExam = 0;

//   //   // Calculate monthly and final exam degrees
//   //   const monthsDegrees = termExamDegrees
//   //     .map((exam) => {
//   //       if (exam.examType === "final") {
//   //         finalTermExam = exam.degree;
//   //         return null; // Skip adding it to monthsDegrees
//   //       }

//   //       // Calculate total degree from daily records
//   //       let totalDegree = 0;
//   //       const relatedRecords = dailyRecords.filter(
//   //         (rec) => rec.examId === exam.examId
//   //       );

//   //       relatedRecords.forEach((record) => {
//   //         totalDegree += record.quizze + record.behavior;
//   //       });

//   //       const avgDegree =
//   //         relatedRecords.length > 0 ? totalDegree / relatedRecords.length : 0;
//   //       const totalMonthDegree = exam.degree + avgDegree;

//   //       totalMonthsDegrees += totalMonthDegree;

//   //       return {
//   //         examId: exam._id,
//   //         examTitle: exam.examTitle,
//   //         examNum: exam.examNum,
//   //         examDegree: exam.degree,
//   //         examType: exam.examType,
//   //         monthTotal: totalMonthDegree,
//   //         totalRecordsDegree: avgDegree,
//   //       };
//   //     })
//   //     .filter(Boolean); // Remove any null values from monthsDegrees

//   //   // Calculate total term degree
//   //   const avgMonthlyDegree =
//   //     monthsDegrees.length > 0 ? totalMonthsDegrees / monthsDegrees.length : 0;
//   //   const totalTermDegree = (avgMonthlyDegree + finalTermExam) / 2;

//   //   return {
//   //     totalMonthsDegrees: avgMonthlyDegree,
//   //     finalTermExam,
//   //     totalTermDegree,
//   //     monthsDegrees,
//   //   };
//   // }
// });

ipcMain.handle("get-student-daily-records", async (event, req) => {
  const { location, studentId } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  console.log(`Request to get-student-daily-records`, req);

  const dailyRecordsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );
  db.dailyRecords = new Datastore({
    filename: dailyRecordsDbPath,
    autoload: true,
  });

  return new Promise((resolve, reject) => {
    db.dailyRecords
      .find({ studentId: studentId })
      .sort({ date: 1 })
      .exec((err, foundDailyRecords) => {
        if (err) {
          console.log(
            `Error Occurs when tryign to find all the daily reocrd of student id: ${studentId}`,
            err
          );
          reject(err);
        } else {
          console.log(
            "student daily records found successfuly",
            foundDailyRecords
          );
          resolve(foundDailyRecords);
        }
      });
  });
});
ipcMain.handle("get-total-student-data", async (event, req) => {
  const { location } = req;
  const { storagePath, selectedSchool, selectedClass, selectedDivision } =
    location;

  console.log(`Request to get-total-student-data`, req);

  const studentsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "students.db"
  );
  const examsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exams.db"
  );
  const examDegreesDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "exam_degrees.db"
  );
  const dailyRecordsDbPath = path.join(
    storagePath,
    selectedSchool,
    selectedClass,
    selectedDivision,
    "dailyRecords.db"
  );

  db.students = new Datastore({ filename: studentsDbPath, autoload: true });
  db.exams = new Datastore({ filename: examsDbPath, autoload: true });
  db.examDegrees = new Datastore({
    filename: examDegreesDbPath,
    autoload: true,
  });
  db.dailyRecords = new Datastore({
    filename: dailyRecordsDbPath,
    autoload: true,
  });

  try {
    const existingExams = await new Promise((resolve, reject) => {
      db.exams.find({}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });

    // If no exams exist, add the specified exams
    if (existingExams.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      const examsToAdd = [
        {
          examNum: 3,
          title: "الكورس الاول",
          type: "final",
          term: 1,
          date: today,
          degrees: [],
        },
        {
          examNum: 6,
          title: "الكورس الثاني",
          type: "final",
          term: 2,
          date: today,
          degrees: [],
        },
        {
          examNum: 5,
          title: "الثاني",
          type: "monthly",
          term: 2,
          date: today,
          degrees: [],
        },
        {
          examNum: 4,
          title: "الاول",
          type: "monthly",
          term: 2,
          date: today,
          degrees: [],
        },
        {
          examNum: 2,
          title: "الثاني",
          type: "monthly",
          term: 1,
          date: today,
          degrees: [],
        },
        {
          examNum: 1,
          title: "الاول",
          type: "monthly",
          term: 1,
          date: today,
          degrees: [],
        },
      ];

      await Promise.all(
        examsToAdd.map((exam) => {
          return new Promise((resolve, reject) => {
            db.exams.insert(exam, (err, newDoc) => {
              if (err) reject(err);
              else resolve(newDoc);
            });
          });
        })
      );

      console.log("Added default exams to the database");
    }

    const foundStudents = await findSortedStudents(db.students);
    if (!foundStudents.length) {
      throw new Error("No students found");
    }

    const [firstTermExams, secondTermExams] = await Promise.all([
      getExpectedMonthlyExams(db.exams, 1),
      getExpectedMonthlyExams(db.exams, 2),
    ]);

    const totalStudentData = await Promise.all(
      foundStudents.map(async (student) => {
        const examDegrees = await findExamDegrees(db.examDegrees, student._id);
        const dailyRecords = await findDailyRecords(
          db.dailyRecords,
          student._id
        );

        const firstTermData = await calculateTermData(
          examDegrees,
          dailyRecords,
          1,
          firstTermExams
        );
        const secondTermData = await calculateTermData(
          examDegrees,
          dailyRecords,
          2,
          secondTermExams
        );

        return {
          _id: student._id,
          name: student.name,
          firstTerm: firstTermData,
          secondTerm: secondTermData,
        };
      })
    );

    console.log("Successfully retrieved student data");
    return totalStudentData;
  } catch (error) {
    console.error("Error in get-total-student-data:", error.message);
    throw error;
  }
});

// Helper functions for database operations
async function findSortedStudents(studentsDb) {
  return new Promise((resolve, reject) => {
    studentsDb
      .find({})
      .sort({ name: 1 })
      .exec((err, students) => {
        if (err) reject(err);
        else resolve(students);
      });
  });
}

async function findExamDegrees(examDegreesDb, studentId) {
  return new Promise((resolve, reject) => {
    examDegreesDb
      .find({ studentId })
      .sort({ examNum: 1 })
      .exec((err, degrees) => {
        if (err) reject(err);
        else resolve(degrees);
      });
  });
}

async function findDailyRecords(dailyRecordsDb, studentId) {
  return new Promise((resolve, reject) => {
    dailyRecordsDb
      .find({ studentId })
      .sort({ date: 1 })
      .exec((err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
  });
}

async function getExpectedMonthlyExams(examsDb, term) {
  return new Promise((resolve, reject) => {
    examsDb.find({ term: term, type: "monthly" }, (err, foundExams) => {
      if (err) {
        console.error("Error occurred when trying to find exams:", err);
        reject(err);
      } else {
        resolve(foundExams.length);
      }
    });
  });
}

const formatDegree = (degree) => {
  return degree % 1 === 0 ? degree : degree.toFixed(1);
};

async function calculateTermData(
  examDegrees,
  dailyRecords,
  term,
  expectedMonthlyExams
) {
  const termExamDegrees = examDegrees.filter((degree) => degree.term === term);

  let totalMonthsDegrees = 0;
  let finalTermExam = 0;
  let monthlyExamCount = 0;

  // Calculate monthly and final exam degrees
  let avgDegree = 0;
  const monthsDegrees = termExamDegrees
    .map((exam) => {
      if (exam.examType === "final") {
        finalTermExam = exam.degree || 0;
        return null; // Skip adding it to monthsDegrees
      }

      monthlyExamCount++;

      // Calculate total degree from daily records
      const relatedRecords = dailyRecords.filter(
        (rec) => rec.examId === exam.examId
      );
      const totalDegree = relatedRecords.reduce(
        (sum, record) => sum + (record.quizze || 0) + (record.behavior || 0),
        0
      );
      const avgDegree =
        relatedRecords.length > 0 ? totalDegree / relatedRecords.length : 0;

      const examDegree = exam.degree || 0;
      const totalMonthDegree = examDegree + avgDegree;

      totalMonthsDegrees += totalMonthDegree;

      return {
        examId: exam._id,
        examTitle: exam.examTitle,
        examNum: exam.examNum,
        examDegree: formatDegree(examDegree), // Use formatDegree to conditionally format
        examType: exam.examType,
        monthTotal: formatDegree(totalMonthDegree), // Use formatDegree to conditionally format
        totalRecordsDegree: formatDegree(avgDegree), // Use formatDegree to conditionally format
      };
    })
    .filter(Boolean); // Remove any null values from monthsDegrees

  // Add missing exams with "لم يمتحن" degree
  for (let i = monthlyExamCount + 1; i <= expectedMonthlyExams; i++) {
    monthsDegrees.push({
      examId: `missing-exam-${i}`,
      examTitle: `الامتحان الشهري ${i}`,
      examNum: i,
      examDegree: "لم يمتحن",
      examType: "monthly",
      monthTotal: 0,
      totalRecordsDegree: avgDegree,
    });
  }

  // Calculate total term degree
  const avgMonthlyDegree =
    monthlyExamCount > 0 ? totalMonthsDegrees / monthlyExamCount : 0;
  const totalTermDegree =
    monthlyExamCount > 0 ? (avgMonthlyDegree + finalTermExam) / 2 : 0;

  return {
    totalMonthsDegrees: formatDegree(totalMonthsDegrees),
    finalTermExam: formatDegree(finalTermExam),
    totalTermDegree: formatDegree(totalTermDegree),
    monthsDegrees,
  };
}
