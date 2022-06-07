import { Router } from "express";
import bodyParser from "body-parser";
import Convert from "./convert";

const router = Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use((req,_, next) => {
    console.log(`Resource requested: ${req.method} ${req.originalUrl}`);
    next();
});

router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Hello world!' });
});

router.use('/convert', Convert);

export default router;
  