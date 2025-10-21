import express from "express";
import { upload } from '../configs/multer.js';
import { protect } from "../middlewares/auth.js";
import { addStory, getStories } from "../controllers/storyController.js";


const storyRouter = express.Router();

storyRouter.post("/create", upload.single('media'), protect, addStory);
storyRouter.get("/get", protect, getStories);

export default storyRouter;