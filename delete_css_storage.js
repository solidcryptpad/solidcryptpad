const fs = require("fs");

// delete community-solid-server storage
// to remove old account storage
fs.rmSync("./community-solid-server", { recursive: true, force: true });
