import cron from 'node-cron';
import Complaint, { ComplaintStatus } from '../models/complaint-model';

export const initSlaEscalationJob = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Running SLA Escalation Check...');

        try {
            const now = new Date();

            // Find complaints that exceeded SLA and are not resolved
            const overdueComplaints = await Complaint.find({
                status: { $nin: [ComplaintStatus.RESOLVED, ComplaintStatus.ESCALATED] },
                slaDeadline: { $lt: now }
            });

            for (const complaint of overdueComplaints) {
                console.log(`[Cron] Escalating complaint: ${complaint.complaintId}`);

                complaint.status = ComplaintStatus.ESCALATED;
                complaint.escalationLevel += 1;
                complaint.history.push({
                    status: ComplaintStatus.ESCALATED,
                    note: `SLA exceeded. Auto-escalating to Level ${complaint.escalationLevel}.`,
                    updatedAt: now
                });

                await complaint.save();

                // TODO: Send notification/email to higher authority
            }
        } catch (error) {
            console.error('[Cron] Error in SLA Escalation Job:', error);
        }
    });
};
