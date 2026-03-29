const prisma = require('../context/prisma');

const assignTasks = async (tasks) => {
    const users = await prisma.users.findMany();
    
    // Calculate current workload per user
    const userWorkload = new Map();
    for (const u of users) {
        const activeTasks = await prisma.tasks.findMany({
            where: { assigned_to: u.id }
        });
        
        let sum = 0;
        for (const t of activeTasks) {
            sum += (t.estimated_hours || 0);
        }
        userWorkload.set(u.id, sum);
    }

    // Sort tasks descending by estimated hours
    tasks.sort((a, b) => (b.estimated_hours || 0) - (a.estimated_hours || 0));

    for (const task of tasks) {
        const role = task.required_role;

        // Find users matching role, sorted by lowest workload
        const eligibleUsers = users
            .filter(u => u.role === role)
            .sort((a, b) => userWorkload.get(a.id) - userWorkload.get(b.id));

        if (eligibleUsers.length > 0) {
            const chosenUser = eligibleUsers[0];
            task.assigned_to = chosenUser.id;
            
            // Advance workload
            const newLoad = userWorkload.get(chosenUser.id) + (task.estimated_hours || 0);
            userWorkload.set(chosenUser.id, newLoad);
        } else {
            console.warn(`No developer found for role ${role} for task ${task.title}`);
        }
    }

    return tasks;
};

module.exports = {
    assignTasks
};
