import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";

router.route("/").get(controllers.courseController.getCourses);
router.route("/:courseId/lectures").get(controllers.courseController.getCourseById);

export default router;