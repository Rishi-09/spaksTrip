import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import {
  listResources,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/partner.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware("partner"));

router.get("/resources", listResources);
router.post("/resources", createResource);
router.put("/resources/:id", updateResource);
router.delete("/resources/:id", deleteResource);

export default router;
