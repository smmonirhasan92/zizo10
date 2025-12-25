const { User, sequelize } = require('../models');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const agents = await User.findAll({ where: { role: 'agent' } });
        console.log(`Found ${agents.length} agents.`);

        agents.forEach(a => {
            console.log(`ID: ${a.id} | Name: "${a.fullName}" | Phone: "${a.phone}"`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

check();
