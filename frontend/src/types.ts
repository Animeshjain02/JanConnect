export type UserRole = 'Citizen' | 'Officer' | 'Admin' | 'Higher Authority';

export const UserRole = {
    CITIZEN: 'Citizen' as UserRole,
    OFFICER: 'Officer' as UserRole,
    ADMIN: 'Admin' as UserRole,
    HIGHER_AUTHORITY: 'Higher Authority' as UserRole,
};

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Reopened' | 'Escalated';

export const ComplaintStatus = {
    SUBMITTED: 'Submitted' as ComplaintStatus,
    UNDER_REVIEW: 'Under Review' as ComplaintStatus,
    ASSIGNED: 'Assigned' as ComplaintStatus,
    IN_PROGRESS: 'In Progress' as ComplaintStatus,
    RESOLVED: 'Resolved' as ComplaintStatus,
    REOPENED: 'Reopened' as ComplaintStatus,
    ESCALATED: 'Escalated' as ComplaintStatus,
};

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
}

export interface Complaint {
    _id: string;
    complaintId: string;
    userId: string | { name: string, email: string };
    title: string;
    description: string;
    category: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    department: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    imageUrl?: string;
    voiceUrl?: string;
    status: ComplaintStatus;
    priorityScore: number;
    priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    slaDeadline: string;
    assignedOfficerId?: { _id: string, name: string };
    assignedOfficerName?: string;
    duplicateCount: number;
    history: Array<{
        status: string;
        updatedAt: string;
        note?: string;
    }>;
    createdAt: string;
}
