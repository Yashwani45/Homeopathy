// Re-export the clean dbConnectionManager to maintain backward compatibility with controllers/routes
const dbConnectionManager = require("../database/dbConnectionManager");
module.exports = dbConnectionManager;