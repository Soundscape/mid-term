import express from "express";
import { router as viewRouter } from "./view-routes.js";
import { router as apiDeviceTypeRouter } from "./api-device-type-routes.js";
import { router as apiDeviceRouter } from "./api-device-routes.js";

const routes = [
  {
    path: "/",
    route: viewRouter,
  },
  {
    path: "/api/device-types",
    route: apiDeviceTypeRouter,
  },
  {
    path: "/api/devices",
    route: apiDeviceRouter,
  },
];

export const router = express.Router();

routes.forEach((route) => router.use(route.path, route.route));
