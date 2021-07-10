import express from "express";
import { check, validationResult } from "express-validator";

import { deviceRepository } from "../data/repositories/index.js";

export const router = express.Router();

/**
 * Retrieves an array of devices
 * @name GET /api/devices/
 * @returns 200 Ok, An array of devices
 */
router.get("/", async (req, res) => {
  const result = await deviceRepository.get();
  return res.status(200).json(result);
});

/**
 * Retrieves a device by its ID
 * @name GET /api/devices/:id
 * @param {number} req.params.id  The ID of the device
 * @returns 200 Ok, A device
 * @returns 400 Bad request, The validation errors
 * @returns 404 Not found
 */
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

/**
 * Creates a new device
 * @name POST /api/devices/
 * @param {device} req.body  A JSON device object in the request's body content
 * @returns 201 Created, A device
 * @returns 400 Bad request, The validation errors
 */
router.post("/", [], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await deviceRepository.create(req.body);

    return res.status(201).json(result);
  } catch (err) {
    return res.sendStatus(500);
  }
});

/**
 * Updates a device
 * @name PUT /api/devices/:id
 * @param {number} req.params.id  The ID of the device
 * @param {device} req.body  A JSON device object in the request's body content
 * @returns 201 Created, A device
 * @returns 400 Bad request, The validation errors
 * @returns 404 Not found
 */
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

/**
 * Deletes a device
 * @name DELETE /api/devices/:id
 * @param {number} req.params.id  The ID of the device
 * @returns 204 No content
 * @returns 400 Bad request, The validation errors
 */
router.delete(
  "/:id",
  [check("id").isInt().withMessage("Invalid ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await deviceRepository.delete(req.params.id);

      return res.sendStatus(204);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);
