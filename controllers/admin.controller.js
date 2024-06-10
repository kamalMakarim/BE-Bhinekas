const { query } = require("express");
const neonPool = require("../connect/connect.neon");
const Kelas = require("../models/kelasSchema");
const Student = require("../models/studentSchema");
const Teacher = require("../models/teacherSchema");
const Parent = require("../models/parentSchema");
const Extracurricular = require("../models/extracurricularSchema");

exports.addUser = async (req, res) => {
  const { username, password, display_name, role } = req.body;
  try {
    if (!username || !password || !display_name || !role) {
      console.log("Username, password, role, and display name are required");
      return res.status(200).json({
        message: "Username, password, and display name are required",
      });
    }
    //check the regex of username and password
    const usernamePattern = /^[a-zA-Z0-9]{6,20}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$.!%*#?&]{8,}$/;

    if (!usernamePattern.test(username)) {
      console.log("Username must be alphanumeric and between 6-20 characters.");
      return res.status(200).json({
        message: "Username must be alphanumeric and between 6-20 characters.",
        payload: null,
      });
    }
    if (!passwordPattern.test(password)) {
      console.log(
        "Password must be at least 8 characters long and contain at least one lowercase letter and one number."
      );
      return res.status(200).json({
        message:
          "Password must be at least 8 characters long and contain at least one lowercase letter and one number.",
        payload: null,
      });
    }

    const { rows: existingUser } = await neonPool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.length > 0) {
      console.log(`Username ${existingUser[0].username} already exists`);
      return res.status(200).json({
        message: `Username ${existingUser[0].username} already exists`,
        payload: null,
      });
    }

    const { rows: insertedUser } = await neonPool.query(
      "INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3) RETURNING *",
      [username, password, display_name]
    );
    let roleQuery;
    switch (role) {
      case "teacher":
        roleQuery = "INSERT INTO teachers (user_id) VALUES ($1) RETURNING *";
        break;
      case "parent":
        roleQuery = "INSERT INTO parents (user_id) VALUES ($1) RETURNING *";
        break;
      case "admin":
        roleQuery = "INSERT INTO admins (user_id) VALUES ($1) RETURNING *";
        break;
      default:
        console.log("Invalid role");
        return res.status(200).json({
          message: "Invalid role",
          payload: null,
        });
    }
    const { rows: insertedRole } = await neonPool.query(roleQuery, [
      insertedUser[0].id,
    ]);
    res.status(201).json({
      message: "User created",
      payload: insertedUser[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getStudents = async (req, res) => {
  const {
    student_class_id,
    parent_name,
    batch,
    special_needs,
    extracurricular_id,
  } = req.query;

  let studentsQuery = "SELECT * FROM students WHERE true";
  let studentsParams = [];
  let extracurricularQuery = "SELECT * FROM extracurriculars WHERE true";
  let extracurricularParams = [];

  const addParam = (value, params) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (student_class_id && student_class_id !== " ") {
    studentsQuery += ` AND class_id = ${addParam(
      student_class_id,
      studentsParams
    )}`;
  }

  if (parent_name && parent_name !== " ") {
    const usersQuery = "SELECT * FROM users WHERE display_name LIKE $1";
    const usersParams = [`%${parent_name}%`];
    const { rows: users } = await neonPool.query(usersQuery, usersParams);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const parents = await Promise.all(
      users.map(async (user) => {
        const { rows: parentRows } = await neonPool.query(
          "SELECT * FROM parents WHERE user_id = $1",
          [user.id]
        );
        if (parentRows.length > 0) {
          return parentRows[0];
        }
      })
    );

    if (parents.length === 0) {
      return res.status(404).json({ message: "No parents found" });
    }

    const parentIds = parents.map((parent) => parent.id);
    studentsQuery += ` AND parent_id IN (${parentIds
      .map((i) => addParam(i, studentsParams))
      .join(",")}`;
    studentsQuery += `)`;
  }

  if (batch && batch != -1) {
    studentsQuery += ` AND batch = ${addParam(batch, studentsParams)}`;
  }

  if (special_needs) {
    studentsQuery += ` AND special_needs = ${addParam(
      special_needs,
      studentsParams
    )}`;
  }

  if (extracurricular_id && extracurricular_id !== " ") {
    extracurricularQuery += ` AND id = ${addParam(
      extracurricular_id,
      extracurricularParams
    )}`;
  }

  try {
    const { rows: students } = await neonPool.query(
      studentsQuery,
      studentsParams
    );
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    const extracurricularResponse = await neonPool.query(
      extracurricularQuery,
      extracurricularParams
    );

    const studentObjects = await Promise.all(
      students.map(async (student) => {
        if (extracurricular_id && extracurricular_id !== " ") {
          const inStudentExtracurriculars = await neonPool.query(
            "SELECT * FROM student_extracurriculars WHERE student_id = $1 AND extracurricular_id = $2",
            [student.id, extracurricularResponse.rows[0].id]
          );
          if (inStudentExtracurriculars.rows.length === 0) {
            return null;
          }
        }

        const { rows: classRows } = await neonPool.query(
          "SELECT * FROM classes WHERE id = $1",
          [student.class_id]
        );
        if (classRows.length === 0) {
          console.error("No class found for ID:", student.class_id);
          return null;
        }
        const classDetail = classRows[0];

        const { rows: extracurriculars } = await neonPool.query(
          "SELECT * FROM extracurriculars WHERE id IN (SELECT extracurricular_id FROM student_extracurriculars WHERE student_id = $1)",
          [student.id]
        );

        const extracurricularDetails = extracurriculars.map((e) => {
          return new Extracurricular(e.id, e.name, e.price);
        });

        return new Student(
          student.id,
          student.name,
          new Kelas(classDetail.id, classDetail.name, classDetail.year),
          student.parent_id,
          student.batch,
          student.special_needs,
          extracurricularDetails
        );
      })
    );

    const filteredStudentObjects = studentObjects.filter((obj) => obj !== null);

    res.status(200).json({
      message: "Get students success",
      payload: filteredStudentObjects,
    });
  } catch (error) {
    console.error("Failed to retrieve students:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getTeachers = async (req, res) => {
  const { user_id, username, display_name, teacher_id, teacher_class } =
    req.body;

  let queryUser = "SELECT * FROM users WHERE true";
  let queryTeacher = "SELECT * FROM teachers WHERE true";

  let paramsUser = [];
  let paramsTeacher = [];

  const addParam = (value, params) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (user_id) {
    queryUser += ` AND id = ${addParam(user_id, paramsUser)}`;
    queryTeacher += ` AND user_id = ${addParam(user_id, paramsTeacher)}`;
  }
  if (username) {
    queryUser += ` AND username = ${addParam(username, paramsUser)}`;
  }
  if (display_name) {
    queryUser += ` AND display_name = ${addParam(display_name, paramsUser)}`;
  }

  if (teacher_id) {
    queryTeacher += ` AND teacher_id = ${addParam(teacher_id, paramsTeacher)}`;
  }
  if (teacher_class) {
    queryTeacher += ` AND class_id = ${addParam(
      teacher_class.id,
      paramsTeacher
    )}`;
  }
  try {
    const [usersResult, teachersResult] = await Promise.all([
      neonPool.query(queryUser, paramsUser),
      neonPool.query(queryTeacher, paramsTeacher),
    ]);
    const users = usersResult.rows;
    const teachers = teachersResult.rows;

    const teacherObjects = await Promise.all(
      teachers.map(async (eachTeacher) => {
        const {
          rows: [classDetail],
        } = await neonPool.query("SELECT * FROM classes WHERE id = $1", [
          eachTeacher.class_id,
        ]);

        const teacherUser = users.find(
          (user) => user.id === eachTeacher.user_id
        );
        if (!teacherUser) {
          console.error(
            "No user found for teacher with ID:",
            eachTeacher.user_id
          );
          return null;
        }

        const classObject = new Kelas(
          classDetail.id,
          classDetail.name,
          classDetail.year
        );

        return new Teacher(
          teacherUser.id,
          teacherUser.username,
          "",
          teacherUser.display_name,
          eachTeacher.id,
          classObject
        );
      })
    );
    const filteredTeacherObjects = teacherObjects.filter((obj) => obj !== null);

    res.status(200).json({
      message: "Get teachers success",
      payload: filteredTeacherObjects,
    });
  } catch (error) {
    console.error("Failed to retrieve teachers:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getParents = async (req, res) => {
  const { user_id, username, display_name, students, parent_id } = req.body;

  let queryUser = "SELECT * FROM users WHERE true";
  let queryParent = "SELECT * FROM parents WHERE true";

  let paramsUser = [];
  let paramsParent = [];

  const addParam = (value, params) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (user_id) {
    queryUser += ` AND id = ${addParam(user_id, paramsUser)}`;
    queryParent += ` AND user_id = ${addParam(user_id, paramsParent)}`;
  }
  if (username) {
    queryUser += ` AND username = ${addParam(username, paramsUser)}`;
  }
  if (display_name) {
    queryUser += ` AND display_name = ${addParam(display_name, paramsUser)}`;
  }
  if (parent_id) {
    queryParent += ` AND id = ${addParam(parent_id, paramsParent)}`;
  }
  if (students) {
    const studentIds = students.map((student) => student.student_id);
    queryParent += ` AND id IN (SELECT parent_id FROM students WHERE id IN (${studentIds
      .map((i) => addParam(i, paramsParent))
      .join(",")}))`;
  }

  try {
    const [usersResult, parentsResult] = await Promise.all([
      neonPool.query(queryUser, paramsUser),
      neonPool.query(queryParent, paramsParent),
    ]);
    const users = usersResult.rows;
    const parents = parentsResult.rows;
    if (parents.length === 0) {
      return res.status(404).json({ message: "No parents found" });
    }

    const parentObjects = await Promise.all(
      parents.map(async (eachParent) => {
        const parentUser = users.find((user) => user.id === eachParent.user_id);
        if (!parentUser) {
          console.error(
            "No user found for parent with ID:",
            eachParent.user_id
          );
          return null; // skip this parent as the user details are necessary
        }

        const { rows: studentsReponse } = await neonPool.query(
          "SELECT * FROM students WHERE parent_id = $1",
          [eachParent.id]
        );

        const studentsDetails = await Promise.all(
          studentsReponse.map(async (student) => {
            const { rows: classRows } = await neonPool.query(
              "SELECT * FROM classes WHERE id = $1",
              [student.class_id]
            );
            if (classRows.length === 0) {
              console.error("No class found for ID:", student.class_id);
              return null;
            }
            const classDetail = classRows[0];

            const { rows: extracurriculars } = await neonPool.query(
              "SELECT * FROM extracurriculars WHERE id IN (SELECT extracurricular_id FROM student_extracurriculars WHERE student_id = $1)",
              [student.id]
            );

            const extracurricularDetails = extracurriculars.map((e) => ({
              id: e.id,
              name: e.name,
              price: e.price,
            }));

            return new Student(
              student.id,
              student.name,
              new Kelas(classDetail.id, classDetail.name, classDetail.year),
              student.parent_id,
              student.batch,
              student.special_needs,
              extracurricularDetails
            );
          })
        );

        return new Parent(
          parentUser.id,
          parentUser.username,
          "",
          parentUser.display_name,
          studentsDetails.filter((s) => s !== null),
          eachParent.id
        );
      })
    );
    const filteredParentObjects = parentObjects.filter((obj) => obj !== null);

    res.status(200).json({
      message: "Get parents success",
      payload: filteredParentObjects,
    });
  } catch (error) {
    console.error("Failed to retrieve parents:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const { rows: classes } = await neonPool.query("SELECT * FROM classes");
    res.status(200).json({ message: "Get classes success", payload: classes });
  } catch (error) {
    console.error("Failed to retrieve classes:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllExtracurriculars = async (req, res) => {
  try {
    const { rows: extracurriculars } = await neonPool.query(
      "SELECT * FROM extracurriculars"
    );
    res.status(200).json({
      message: "Get extracurriculars success",
      payload: extracurriculars,
    });
  } catch (error) {
    console.error("Failed to retrieve extracurriculars:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
