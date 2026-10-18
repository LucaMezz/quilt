import { createApp } from "./app";
import { ENV } from "./env.server";
import { auth, db, storage } from "./services";

const app = createApp({
    auth,
    db,
    storage,
    corsOrigin: ENV.CORS_ORIGIN,
    appsDomain: ENV.APPS_DOMAIN,
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
