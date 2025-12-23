import db from "../db/connection.js";

export const findUserByName = async (name) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE name = ?",
    [name]
  );
  return rows[0];
};

export const createUser = async (name, password, role) => {
  const [result] = await db.query(
    "INSERT INTO users (name, password, role) VALUES (?, ?, ?)",
    [name, password, role]
  );
  return result.insertId;
};
