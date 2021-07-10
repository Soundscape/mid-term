import express from "express";
import { check, validationResult } from "express-validator";

export const router = express.Router();

/**
 * Renders the index view
 * @name GET /
 * @returns 200 Ok, The rendered index HTML
 */
router.get("/", async (req, res) => {
  res.render("index");
});

/**
 * Renders the about view
 * @name GET /about
 * @returns 200 Ok, The rendered about HTML
 */
router.get("/about", async (req, res) => {
  res.render("about");
});

/**
 * Renders the add device view
 * @name GET /devices/add
 * @returns 200 Ok, The rendered add device HTML
 */
router.get("/devices/add", async (req, res) => {
  res.render("devices/add");
});

/**
 * Renders the edit device view
 * @name GET /devices/:id/edit
 * @param {number} req.params.id  The device ID (Key)
 * @returns 200 Ok, The rendered edit device HTML
 * @returns 400 Bad request, The validation errors
 */
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

/**
 * Renders the display device view
 * @name GET /devices/:id
 * @param {number} req.params.id  The device ID (Key)
 * @returns 200 Ok, The rendered display device HTML
 * @returns 400 Bad request, The validation errors
 */
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
