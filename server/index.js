import express from "express";
import config from "config";
import exphbs from "express-handlebars";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { router } from "./routes/main.js";

const app = express();

app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, "public")));

app.set("views", join(__dirname, "views"));

app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use("/", router);
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(config.port, () =>
  console.log(`Server listening on port ${config.port}`)
);
