import express from "express";
import { check, validationResult } from "express-validator";

import { deviceRepository } from "../data/repositories/index.js";

export const router = express.Router();

router.get("/", async (req, res) => {
  const result = await deviceRepository.get();
  return res.status(200).json(result);
});

router.get(
  "/:id",
  [check("id").isInt().withMessage("Invalid ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await deviceRepository.getById(req.params.id);

      if (!result) return res.sendStatus(404);

      return res.status(200).json(result);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);

router.post("/", [], async (req, res) => {
  try {
    const result = await deviceRepository.create(req.body);

    return res.status(201).json(result);
  } catch (err) {
    return res.sendStatus(500);
  }
});

router.put(
  "/:id",
  [check("id").isInt().withMessage("Invalid ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await deviceRepository.update(
        Object.assign({ id: req.params.id }, req.body)
      );

      if (!result) return res.sendStatus(404);

      return res.status(200).json(result);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);

router.delete(
  "/:id",
  [check("id").isInt().withMessage("Invalid ID")],
  async (req, res) => {
    try {
      await deviceRepository.delete(req.params.id);

      return res.sendStatus(204);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);
