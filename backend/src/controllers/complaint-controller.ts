import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware.js';
import Complaint, { ComplaintStatus } from '../models/complaint-model';
import User, { UserRole } from '../models/user-model';
import { processComplaintWithAI } from '../services/llm-service';
import { findDuplicateComplaint } from '../services/duplicate-service';
import { v4 as uuidv4 } from 'uuid';

export const createComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, location, imageUrl, voiceUrl } = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // 0. Check for duplicates
        const existingComplaints = await Complaint.find({
            status: { $ne: ComplaintStatus.RESOLVED },
            'location.lat': { $gt: location.lat - 0.01, $lt: location.lat + 0.01 }, // simplistic proximity check
            'location.lng': { $gt: location.lng - 0.01, $lt: location.lng + 0.01 }
        });

        const duplicate = await findDuplicateComplaint(description, existingComplaints);
        if (duplicate) {
            duplicate.duplicateCount += 1;
            duplicate.priorityScore += 5; // increase priority for merged issues
            duplicate.history.push({
                status: duplicate.status,
                note: 'New duplicate complaint detected. Metadata merged.',
                updatedAt: new Date()
            });
            await duplicate.save();
            return res.status(200).json({ message: 'Duplicate detected and merged', complaint: duplicate });
        }

        // 1. Process with AI (LLM Service)
        const aiResult = await processComplaintWithAI(description, imageUrl);

        // 2. Generate Unique Complaint ID
        const complaintId = `COMP-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

        // 3. Calculate SLA (e.g., 3 days for Critical, 7 days for Low)
        const slaDays = aiResult.severity === 'Critical' ? 1 : aiResult.severity === 'High' ? 3 : 7;
        const slaDeadline = new Date();
        slaDeadline.setDate(slaDeadline.getDate() + slaDays);

        // 4. Create Complaint
        const complaint = new Complaint({
            complaintId,
            userId: req.user.id,
            title,
            description,
            category: aiResult.issue_type,
            severity: aiResult.severity,
            priorityLevel: aiResult.severity, // initial priority level
            department: aiResult.department,
            location,
            imageUrl,
            voiceUrl,
            status: ComplaintStatus.SUBMITTED,
            slaDeadline,
            priorityScore: aiResult.confidence * 10,
            history: [{ status: ComplaintStatus.SUBMITTED, note: 'Complaint submitted by citizen.' }]
        });

        await complaint.save();

        res.status(201).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        let query: any = {};

        if (req.user.role === UserRole.OFFICER) {
            // For officers, fetch their department first
            const officer = await User.findById(req.user.id);
            if (!officer || !officer.department) {
                return res.status(400).json({ message: 'Officer department not found' });
            }
            // Fetch all complaints for their department
            query = { department: officer.department };
        } else {
            // For citizens, fetch only their own complaints
            query = { userId: req.user.id };
        }

        const complaints = await Complaint.find(query)
            .populate('userId', 'name email') // Populate reporter details
            .populate('assignedOfficerId', 'name') // Populate officer details
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        if (!Object.values(ComplaintStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Only officers or admins can update status
        if (req.user?.role !== UserRole.OFFICER && req.user?.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Unauthorized to update status' });
        }

        complaint.status = status;
        complaint.history.push({
            status,
            note: note || `Status updated to ${status} by ${req.user.role}`,
            updatedAt: new Date()
        });

        await complaint.save();

        // Return populated complaint
        const updatedComplaint = await Complaint.findById(id)
            .populate('userId', 'name email')
            .populate('assignedOfficerId', 'name');
        res.status(200).json(updatedComplaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const assignOfficerByName = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { officerName } = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (req.user.role !== UserRole.OFFICER && req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Only officers or admins can assign complaints' });
        }
        if (!officerName || !officerName.trim()) {
            return res.status(400).json({ message: 'Officer name is required' });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        complaint.assignedOfficerName = officerName.trim();
        // Auto-advance status if still unassigned
        if (complaint.status === ComplaintStatus.SUBMITTED || complaint.status === ComplaintStatus.UNDER_REVIEW) {
            complaint.status = ComplaintStatus.ASSIGNED;
        }
        complaint.history.push({
            status: complaint.status,
            note: `Assigned to Officer: ${officerName.trim()}.`,
            updatedAt: new Date()
        });

        await complaint.save();

        const updated = await Complaint.findById(id)
            .populate('userId', 'name email')
            .populate('assignedOfficerId', 'name');

        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const confirmResolution = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id);

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        if (complaint.userId.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Only the reporter can confirm resolution' });
        }

        complaint.status = ComplaintStatus.RESOLVED;
        complaint.history.push({
            status: ComplaintStatus.RESOLVED,
            note: 'Citizen confirmed resolution.',
            updatedAt: new Date()
        });

        await complaint.save();
        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const reopenComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id);

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        if (complaint.userId.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Only the reporter can reopen' });
        }

        complaint.status = ComplaintStatus.REOPENED;
        complaint.priorityScore += 10; // Auto-escalate
        complaint.escalationLevel += 1;
        complaint.history.push({
            status: ComplaintStatus.REOPENED,
            note: 'Citizen reopened the complaint. Auto-escalating priority.',
            updatedAt: new Date()
        });

        await complaint.save();
        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getComplaintById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id).populate('userId', 'name email');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Public — no auth required. Used by WhatsApp bot to track status by complaintId string.
export const getComplaintStatusPublic = async (req: any, res: Response) => {
    try {
        const { complaintId } = req.params;

        // complaintId is the human-readable string like COMP-1234-ABCD
        const complaint = await Complaint.findOne({ complaintId })
            .populate('assignedOfficerId', 'name')
            .select('complaintId title status department severity priorityLevel slaDeadline assignedOfficerId assignedOfficerName history createdAt');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.status(200).json({
            complaintId: complaint.complaintId,
            title: complaint.title,
            status: complaint.status,
            department: complaint.department,
            severity: complaint.severity,
            priorityLevel: complaint.priorityLevel,
            slaDeadline: complaint.slaDeadline,
            assignedOfficer: (complaint as any).assignedOfficerName || (complaint.assignedOfficerId as any)?.name || 'Pending Assignment',
            lastUpdate: complaint.history?.[complaint.history.length - 1] || null,
            submittedAt: complaint.createdAt
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
