const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const TaskAd = require('../models/TaskAd');

// Manually Initialize Sequelize because scripts run outside app context
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

// Define Model again or require it carefully? 
// Our TaskAd.js requires sequelize instance. 
// Easier to just use raw query or redefine for script.
// Let's use Raw Query for simplicity and robustness in script.

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Note: server.js handles Sync. We assume table exists after restart.
        // Wait, if I run this BEFORE restart, table might not exist?
        // Let's rely on server restart to create table first.

        // But I want to seed now.
        // I will use `sequelize.sync` here too.

        // Redefine TaskAd for script context
        const TaskAdModel = sequelize.define('TaskAd', {
            title: { type: Sequelize.STRING, allowNull: false },
            imageUrl: { type: Sequelize.STRING, allowNull: false },
            reviewText: { type: Sequelize.TEXT, allowNull: false },
            adLink: { type: Sequelize.STRING, allowNull: false },
            status: { type: Sequelize.ENUM('active'), defaultValue: 'active' },
            priority: { type: Sequelize.INTEGER, defaultValue: 0 }
        });

        await TaskAdModel.sync({ alter: true });

        const ads = [
            {
                title: 'iPhone 16 Pro Max',
                imageUrl: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg',
                reviewText: 'The ultimate iPhone with A18 Pro chip and larger display. Experience pro photography like never before.',
                adLink: 'https://apple.com',
                status: 'active',
                priority: 10
            },
            {
                title: 'Samsung Galaxy S25 Ultra',
                imageUrl: 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-1.jpg',
                reviewText: 'AI-powered flagship with Titanium frame. The best Android experience available today.',
                adLink: 'https://samsung.com',
                status: 'active',
                priority: 9
            },
            {
                title: 'MacBook Air M3',
                imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000',
                reviewText: 'Lean. Mean. M3 Machine. Supercharged by the M3 chip for incredible performance.',
                adLink: 'https://apple.com/mac',
                status: 'active',
                priority: 8
            },
            {
                title: 'Sony WH-1000XM5',
                imageUrl: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_UF1000,1000_QL80_.jpg',
                reviewText: 'Industry-leading noise cancellation. Distraction-free listening at its finest.',
                adLink: 'https://sony.com',
                status: 'active',
                priority: 7
            }
        ];

        for (const ad of ads) {
            await TaskAdModel.create(ad);
        }

        console.log('Seeding Complete: 4 Ads Created.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
