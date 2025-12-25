const { Transaction, User, sequelize } = require('./models');

async function check() {
    try {
        console.log("--- DEBUG CHECK 103 ---");

        // 1. Fetch User 'user-02'
        const agent = await User.findOne({ where: { username: 'user-02' } });
        if (!agent) {
            console.log("CRITICAL: Agent 'user-02' NOT FOUND in DB!");
        } else {
            console.log(`Agent 'user-02' Found. ID: ${agent.id} | Role: ${agent.role}`);
        }

        // 2. Fetch Transaction 103
        const trx = await Transaction.findByPk(103);
        if (!trx) {
            console.log("CRITICAL: Transaction 103 NOT FOUND in DB!");
        } else {
            console.log(`Transaction 103 Found.`);
            console.log(`- Status: ${trx.status}`);
            console.log(`- Amount: ${trx.amount}`);
            console.log(`- Type: ${trx.type}`);
            console.log(`- AssignedAgentId: ${trx.assignedAgentId}`);
            console.log(`- ReceivedByAgentId: ${trx.receivedByAgentId}`);

            if (agent) {
                const matchAssigned = trx.assignedAgentId === agent.id;
                const matchReceived = trx.receivedByAgentId === agent.id;
                console.log(`- Match Agent? Assigned: ${matchAssigned}, Received: ${matchReceived}`);

                if (!matchAssigned && !matchReceived) {
                    console.log("MISMATCH: Transaction is NOT linked to user-02.");
                } else if (trx.status !== 'pending') {
                    console.log(`MISMATCH: Status is '${trx.status}', expected 'pending' to show in queue.`);
                } else {
                    console.log("SUCCESS: Transaction SHOULD show in queue.");
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
