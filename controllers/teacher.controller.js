const { query } = require("express");
const neonPool = require("../connect/connect.neon");
const Student = require("../models/studentSchema");
const Kelas = require("../models/kelasSchema");

exports.getMystudents = async (req, res) => {
  const { class_id } = req.query;
  try {
    const { rows: studentsReponse } = await neonPool.query(
      `SELECT * FROM students WHERE class_id = $1`,
      [class_id]
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
    res
      .status(200)
      .send({ message: "Get My Students Succeed", payload: studentsDetails });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
