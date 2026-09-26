import db from "./db.js";

const favorites = db.prepare("SELECT * FROM favorites").all();

console.log("Saved favorites:", favorites);
