const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('./models');
require('dotenv').config();

async function run() {
    try {
        const agent = await User.findOne({ where: { role: 'agent' } });
        if (!agent) {
            console.log('No agent found.');
            return;
        }
        console.log('Found Agent:', agent.username, agent.id);

        const payload = {
            user: {
                id: agent.id,
                role: agent.role
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token');

        try {
            const res = await axios.get('http://localhost:5000/api/agent/stats', {
                headers: { 'x-auth-token': token }
            });
            console.log('Response:', res.data);
        } catch (err) {
            console.error('Request Failed:', err.response ? err.response.data : err.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
