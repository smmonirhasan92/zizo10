const { User, sequelize } = require('../models');

async function checkUsers() {
    try {
        const users = await User.findAll({
            where: { id: [1, 2, 3] },
            attributes: ['id', 'fullName', 'username', 'phone', 'role', 'kycStatus']
        });
        console.log(JSON.stringify(users, null, 2));

        const admin = users.find(u => u.id === 1);
        if (admin && admin.role !== 'super_admin') {
            console.log(`Fixing Admin Role from ${admin.role} to super_admin...`);
            await User.update({ role: 'super_admin' }, { where: { id: 1 } });
            console.log('Fixed!');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
