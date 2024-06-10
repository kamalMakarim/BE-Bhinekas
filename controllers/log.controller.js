const neonPool = require("../connect/connect.neon");
const Kelas = require("../models/kelasSchema");

exports.getLogs = async (req, res) => {
  const { class_id, for_special_kids } = req.query;
  try {
    const { rows } = await neonPool.query(
      `SELECT * FROM logs WHERE class_id = $1 AND for_special_kids = $2`,
      [class_id, for_special_kids]
    );
    const logs = await Promise.all(
      rows.map(async (log) => {
        const { rows: kelas } = await neonPool.query(
          `SELECT * FROM classes WHERE id = $1`,
          [log.class_id]
        );
        log.kelas = kelas[0];
        log.created_at = new Date(
          log.created_at.getTime() + 7 * 60 * 60 * 1000
        );
        log.created_at = formatTimestamp(log.created_at);
        return log;
      })
    );
    console.log(logs);
    res.status(200).send({ message: "Logs retrieved", payload: logs });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.postLog = async (req, res) => {
  const { message, class_id, for_special_kids } = req.body;
  try {
    const { rows: log } = await neonPool.query(
      `INSERT INTO logs (message, class_id, for_special_kids) VALUES ($1, $2, $3) RETURNING *`,
      [message, class_id, for_special_kids]
    );
    const { rows: kelas } = await neonPool.query(
      `SELECT * FROM classes WHERE id = $1`,
      [class_id]
    );
    log[0].kelas = new Kelas(kelas[0].id, kelas[0].name, kelas[0].year);
    log[0].created_at = new Date(log[0].created_at.getTime() + 7 * 60 * 60 * 1000);
    log[0].created_at = formatTimestamp(log[0].created_at);
    res.status(201).send({ message: "Log created", payload: log[0]});
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return (
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2) +
    " " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2) +
    ":" +
    ("0" + date.getSeconds()).slice(-2)
  );
}
