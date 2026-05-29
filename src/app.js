import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = process.env.FRONTEND_DIST_PATH || path.join(__dirname, "../dist");

app.use(express.static(frontendDist));

// app.use((req, res, next) => {
//     console.log("===== Incoming Request =====");

//     console.log("Method:", req.method);
//     console.log("URL:", req.originalUrl);

//     console.log("Body:", req.body);

//     console.log("Query:", req.query);

//     console.log("Params:", req.params);

//     console.log("============================");

//     next();
// });


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Serve SPA fallback for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDist, "index.html"), (err) => {
        if (err) next(err);
    });
});




export default app;