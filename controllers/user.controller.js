const User = require("../models/userSchema");
const Teacher = require("../models/teacherSchema");
const Parent = require("../models/parentSchema");
const Admin = require("../models/adminSchema");
const Student = require("../models/studentSchema");
const Kelas = require("../models/kelasSchema");
const neonPool = require("../connect/connect.neon");
const Extracurricular = require("../models/extracurricularSchema");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows: users } = await neonPool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    const user = users[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const roleQueries = [
      neonPool.query("SELECT * FROM teachers WHERE user_id = $1", [user.id]),
      neonPool.query("SELECT * FROM parents WHERE user_id = $1", [user.id]),
      neonPool.query("SELECT * FROM admins WHERE user_id = $1", [user.id]),
    ];
    const [teachers, parents, admins] = await Promise.all(
      roleQueries.map((query) => query.then((result) => result.rows[0]))
    );

    let payload;

    if (teachers) {
      const classDatabase = await neonPool.query(
        "SELECT * FROM classes WHERE id = $1",
        [teachers.class_id]
      );
      const classObject = new Kelas(
        classDatabase.rows[0].id,
        classDatabase.rows[0].name,
        classDatabase.rows[0].year
      );
      payload = new Teacher(
        teachers.user_id,
        user.username,
        user.password,
        user.display_name,
        teachers.id,
        classObject
      );
    } else if (parents) {
      const foundStudents = await neonPool.query(
        "SELECT * FROM students WHERE parent_id = $1",
        [parents.id]
      );
      const students = await Promise.all(
        foundStudents.rows.map(async (student) => {
          const classResponse = await neonPool.query(
            "SELECT * FROM classes WHERE id = $1",
            [student.class_id]
          );
          const classObject = new Kelas(
            classResponse.rows[0].id,
            classResponse.rows[0].name,
            classResponse.rows[0].year
          );
          const extracurricularsIds = await neonPool.query(
            "SELECT * FROM student_extracurriculars WHERE student_id = $1",
            [student.id]
          );
          const extracurriculars = await Promise.all(
            extracurricularsIds.rows.map(async (extracurricular) => {
              const extracurricularResponse = await neonPool.query(
                "SELECT * FROM extracurriculars WHERE id = $1",
                [extracurricular.extracurricular_id]
              );
              const extracurricularObject = new Extracurricular(
                extracurricularResponse.rows[0].id,
                extracurricularResponse.rows[0].name,
                extracurricularResponse.rows[0].price
              );
              return extracurricularObject;
            })
          );
          return new Student(
            student.id,
            student.name,
            classObject,
            student.parent_id,
            student.batch,
            student.special_needs,
            extracurriculars
          );
        })
      );
      payload = new Parent(
        parents.user_id,
        user.username,
        user.password,
        user.display_name,
        students,
        parents.id
      );
    } else if (admins) {
      payload = new Admin(
        admins.user_id,
        user.username,
        user.password,
        user.display_name,
        admins.id
      );
    }
    res.status(200).json({ message: "Login success", payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logins = async (req, res) => {
  const { username, password } = req.body;
  if (username == "user" && password == "password") {
    res
      .status(200)
      .send({
        message: "Login success",
        payload: { role: "user", username: "user", password: "password" },
      });
  } else if (username == "admin" && password == "password") {
    res
      .status(200)
      .send({
        message: "Login success",
        payload: { role: "admin", username: "admin", password: "password" },
      });
  } else {
    res.status(400).send({ message: "Invalid username or password" });
  }
};
