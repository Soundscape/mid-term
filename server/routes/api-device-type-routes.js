import express from "express";
import { check, validationResult } from "express-validator";

import { deviceTypeRepository } from "../data/repositories/index.js";

export const router = express.Router();

/**
 * Retrieves an array of device types
 * @name GET /api/devices-types/
 * @returns 200 Ok, An array of device types
 */
router.get("/", async (req, res) => {
  const result = await deviceTypeRepository.get();
  return res.status(200).json(result);
});

/**
 * Retrieves a device type by its ID
 * @name GET /api/device-types/:id
 * @param {number} req.params.id  The ID of the device type
 * @returns 200 Ok, A device type
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
      const result = await deviceTypeRepository.getById(req.params.id);

      if (!result) return res.sendStatus(404);

      return res.status(200).json(result);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);

/**
 * Creates a new device type
 * @name POST /api/device-types/
 * @param {device} req.body  A JSON device type object in the request's body content
 * @returns 201 Created, A device type
 * @returns 400 Bad request, The validation errors
 */
router.post("/", [], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await deviceTypeRepository.create(req.body);

    return res.status(201).json(result);
  } catch (err) {
    return res.sendStatus(500);
  }
});

/**
 * Updates a device type
 * @name PUT /api/device-types/:id
 * @param {number} req.params.id  The ID of the device type
 * @param {device} req.body  A JSON device type object in the request's body content
 * @returns 201 Created, A device type
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
      const result = await deviceTypeRepository.update(
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
 * Deletes a device type
 * @name DELETE /api/device-types/:id
 * @param {number} req.params.id  The ID of the device type
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
      await deviceTypeRepository.delete(req.params.id);

      return res.sendStatus(204);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);
