"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("./controllers/auth"));
const ErrorHandlerMiddleWare_1 = __importDefault(require("./Middlewares/ErrorHandlerMiddleWare"));
const jobApplication_1 = require("./controllers/jobApplication");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max requests per IP
    message: "Too many requests from this IP, please try again later"
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(limiter);
app.use((0, cors_1.default)({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/job', jobApplication_1.JobRouter);
app.get('/', (req, res) => {
    res.send('job apllication tracker is live....');
});
// app.use(ZodError)
app.use(ErrorHandlerMiddleWare_1.default);
app.listen(PORT, () => {
    console.log(`SERVER IS LISTENING IN PORT: ${PORT}`);
});
