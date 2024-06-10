const neonPool = require("../connect/connect.neon");
exports.getChatLogs = async (req, res) => {
  const { log_id, student_id, reader_id } = req.query;

  try {
    const chatLogsResult = await neonPool.query(
      `SELECT * FROM chatlogs WHERE (student_id = $1 AND log_id = $2)`,
      [student_id, log_id]
    );
    const result = await Promise.all(
      chatLogsResult.rows.map(async (chatLog) => {
        if (chatLog.sender_id !== reader_id) {
          await neonPool.query(
            `UPDATE chatlogs SET read = true, created_at = $2 WHERE id = $1`,
            [chatLog.id, chatLog.created_at]
          );
          chatLog.read = true;
        }
        const { rows: sender } = await neonPool.query(
          `SELECT display_name, id, username FROM users WHERE id = $1`,
          [chatLog.sender_id]
        );
        const { rows: log } = await neonPool.query(
          `SELECT * FROM logs WHERE id = $1`,
          [chatLog.log_id]
        );
        const { rows: kelas } = await neonPool.query(
          `SELECT * FROM classes WHERE id = $1`,
          [log[0].class_id]
        );
        log[0].kelas = kelas[0];
        log[0].created_at = new Date(
          log[0].created_at.getTime() + 7 * 60 * 60 * 1000
        );
        log[0].created_at = formatTimestamp(log[0].created_at);
        chatLog.sender = sender[0];
        chatLog.log = log[0];
        chatLog.created_at = new Date(
          chatLog.created_at.getTime() + 7 * 60 * 60 * 1000
        );
        chatLog.created_at = formatTimestamp(chatLog.created_at);
        return chatLog;
      })
    );
    console.log(result);
    res.status(200).send({ message: "Get Chat Logs Succeed", payload: result });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

exports.postChatLogs = async (req, res) => {
  const { sender_id, student_id, log_id, message } = req.body;
  try {
    const { rows: chatLog } = await neonPool.query(
      `INSERT INTO chatlogs(sender_id, student_id, log_id, message) VALUES($1, $2, $3, $4) RETURNING *`,
      [sender_id, student_id, log_id, message]
    );
    const { rows: sender } = await neonPool.query(
      `SELECT display_name, id, username FROM users WHERE id = $1`,
      [chatLog[0].sender_id]
    );
    const { rows: log } = await neonPool.query(
      `SELECT * FROM logs WHERE id = $1`,
      [log_id]
    );
    const { rows: kelas } = await neonPool.query(
      `SELECT * FROM classes WHERE id = $1`,
      [log[0].class_id]
    );
    log[0].kelas = kelas[0];
    log[0].created_at = new Date(
      log[0].created_at.getTime() + 7 * 60 * 60 * 1000
    );
    log[0].created_at = formatTimestamp(log[0].created_at);
    chatLog[0].sender = sender[0];
    chatLog[0].log = log[0];
    chatLog[0].created_at = new Date(
      chatLog[0].created_at.getTime() + 7 * 60 * 60 * 1000
    );
    chatLog[0].created_at = formatTimestamp(chatLog[0].created_at);

    res
      .status(200)
      .send({ message: "Chat log successfully created", payload: chatLog[0] });
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
