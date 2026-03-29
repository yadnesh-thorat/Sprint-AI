const express = require('express');
const router = express.Router();
const multer = require('multer');
const prisma = require('../context/prisma');
const { generateAgileBoardFromSrs } = require('../services/aiService');
const { extractTextFromPdf } = require('../services/pdfService');
const { assignTasks } = require('../services/assignmentService');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-srs', upload.single('file'), async (req, res) => {
    try {
        const { name, deadline, content } = req.body;
        let finalContent = content;

        if (req.file) {
            finalContent = await extractTextFromPdf(req.file.buffer);
        }

        if (!finalContent || finalContent.trim() === '') {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Save Project & Doc Initial
        const newProject = await prisma.projects.create({
            data: {
                name,
                deadline: deadline ? new Date(deadline) : null,
                srs_documents: {
                    create: { content: finalContent }
                }
            },
            include: { srs_documents: true }
        });

        // Generate AI Output
        const users = await prisma.users.findMany();
        const teamStructure = users.map(u => `${u.name} (${u.role})`).join(', ');

        const aiResponse = await generateAgileBoardFromSrs(finalContent, teamStructure, deadline || "No deadline");

        if (aiResponse && aiResponse.epics) {
            let allTasksToAssign = [];

            // We must process sequentially because of relations
            for (const epicDto of aiResponse.epics) {
                const epic = await prisma.epics.create({
                    data: {
                        title: epicDto.title,
                        project_id: newProject.id
                    }
                });

                if (epicDto.stories) {
                    for (const storyDto of epicDto.stories) {
                        const story = await prisma.stories.create({
                            data: {
                                title: storyDto.title,
                                description: storyDto.description,
                                acceptance_criteria: storyDto.acceptance_criteria ? storyDto.acceptance_criteria.join('\n') : '',
                                priority: storyDto.priority,
                                epic_id: epic.id
                            }
                        });

                        if (storyDto.tasks) {
                            for (const taskDto of storyDto.tasks) {
                                // Add to queue for workload balancing
                                allTasksToAssign.push({
                                    title: taskDto.title,
                                    description: taskDto.description,
                                    estimated_hours: taskDto.estimated_hours,
                                    story_points: taskDto.story_points || 1,
                                    required_role: taskDto.assigned_role,
                                    status: 'TODO',
                                    story_id: story.id
                                });
                            }
                        }
                    }
                }
            }

            // Perform Task Assignment
            const balancedTasks = await assignTasks(allTasksToAssign);

            // Save Tasks to DB
            for (const task of balancedTasks) {
                await prisma.tasks.create({
                    data: task
                });
            }
        }

        const projectData = await prisma.projects.findUnique({
            where: { id: newProject.id },
            include: {
                epics: {
                    include: {
                        stories: {
                            include: { tasks: true }
                        }
                    }
                }
            }
        });

        res.json(projectData);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: `AI Processing Error: ${error.message}` });
    }
});

router.get('/project-board', async (req, res) => {
    try {
        const allProjects = await prisma.projects.findMany({
            include: {
                epics: {
                    include: {
                        stories: {
                            include: { 
                                tasks: {
                                    include: { 
                                        users: true,
                                        subtasks: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Map 'users' to 'assignedTo' for frontend compatibility
        const formattedProjects = allProjects.map(p => ({
            ...p,
            epics: p.epics.map(e => ({
                ...e,
                stories: e.stories.map(s => ({
                    ...s,
                    tasks: s.tasks.map(t => ({
                        ...t,
                        assignedTo: t.users,
                        subtasks: t.subtasks || []
                    }))
                }))
            }))
        }));

        res.json(formattedProjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to fetch board: ${error.message}`, stack: error.stack });
    }
});

router.put('/update-task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, description } = req.body;
        
        const updatedData = {};
        if (status) updatedData.status = status;
        if (description) updatedData.description = description;

        const updatedTask = await prisma.tasks.update({
            where: { id: parseInt(taskId) },
            data: updatedData
        });

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

router.put('/update-story/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { title, description } = req.body;
        
        const updatedStory = await prisma.stories.update({
            where: { id: parseInt(storyId) },
            data: { title, description }
        });

        res.json(updatedStory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update story' });
    }
});

// Team Management
router.get('/team', async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

router.post('/team', async (req, res) => {
    try {
        const { name, role } = req.body;
        if (!name || !role) {
            return res.status(400).json({ error: 'Name and role are required' });
        }

        const newUser = await prisma.users.create({
            data: { name, role }
        });

        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
});

router.delete('/team/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await prisma.users.delete({
            where: { id: parseInt(userId) }
        });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to offboard team member' });
    }
});

// SUBTASK ENDPOINTS
router.post('/tasks/:taskId/subtasks', async (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const { title } = req.body;
        const newSubtask = await prisma.subtasks.create({
            data: {
                title,
                task_id: taskId,
                done: false
            }
        });
        res.status(201).json(newSubtask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add subtask' });
    }
});

router.put('/subtasks/:subtaskId', async (req, res) => {
    try {
        const subtaskId = parseInt(req.params.subtaskId);
        const { done, title } = req.body;
        const updated = await prisma.subtasks.update({
            where: { id: subtaskId },
            data: { done, title }
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update subtask' });
    }
});

router.delete('/subtasks/:subtaskId', async (req, res) => {
    try {
        const subtaskId = parseInt(req.params.subtaskId);
        await prisma.subtasks.delete({ where: { id: subtaskId } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete subtask' });
    }
});

module.exports = router;
