try {
    console.log("1. Loading Models...");
    const models = require('../models');
    console.log("2. Models Loaded Keys:", Object.keys(models));
    console.log("3. Attempting DB Auth...");
    models.sequelize.authenticate().then(() => {
        console.log("✅ DB Auth Success");
    }).catch(e => {
        console.error("❌ DB Auth Failed:", e.message);
    });
} catch (err) {
    console.error("❌ Model Loading Crashed:");
    console.error(err);
}
