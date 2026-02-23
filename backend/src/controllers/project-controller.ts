import { Request, Response } from 'express';
import Project, { ProjectStatus } from '../models/project-model';
import { AuthRequest } from '../middleware/auth-middleware';
import { UserRole } from '../models/user-model';

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== UserRole.OFFICER && req.user?.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Only officers can post projects' });
        }

        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rateProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Remove existing rating from same user if exists
        project.ratings = project.ratings.filter(r => r.userId.toString() !== req.user?.id);

        project.ratings.push({
            userId: req.user!.id as any,
            score,
            feedback
        });

        await project.save();
        res.status(200).json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
