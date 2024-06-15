const neonPool = require("../connect/connect.neon");

exports.getBill = async (req, res) => {
  const { student_id } = req.query;
  try {
    const { rows } = await neonPool.query(
      `SELECT * FROM bills WHERE student_id = $1`,
      [student_id]
    );
    res.status(200).send({ message: "Bills retrieved", payload: rows });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.postBill = async (req, res) => {
  const { student_id, amount, description } = req.body;
  try {
    const { rows: bill } = await neonPool.query(
      `INSERT INTO bills (student_id, amount, description) VALUES ($1, $2, $3) RETURNING *`,
      [student_id, amount, description]
    );
    res.status(201).send({ message: "Bill created", payload: bill[0] });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

