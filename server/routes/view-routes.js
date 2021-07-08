import express from "express";
import { check, validationResult } from "express-validator";

export const router = express.Router();

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/about", async (req, res) => {
  res.render("about");
});

router.get("/devices/add", async (req, res) => {
  res.render("devices/add");
});

router.get(
  "/devices/:id/edit",
  [check("id").isInt().withMessage("Invalid ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.render("devices/edit", { id: req.params.id });
  }
);

router.get(
  "/devices/:id",
  [check("id").isInt().withMessage("Invalid ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.render("devices/view", { id: req.params.id });
  }
);
