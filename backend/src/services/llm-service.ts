import axios from 'axios';

export interface LLMProcessingResult {
    issue_type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    department: string;
    confidence: number;
}

export const processComplaintWithAI = async (description: string, imageUrl?: string): Promise<LLMProcessingResult> => {
    // TODO: Implement actual Gemini AI call here
    // For now, we return a mock structured response

    console.log(`[AI Service] Processing complaint: "${description.substring(0, 50)}..."`);

    // Simulated logic for mock response
    const lowerDesc = description.toLowerCase();
    let result: LLMProcessingResult = {
        issue_type: 'General',
        severity: 'Medium',
        department: 'General Administration',
        confidence: 0.85
    };

    if (lowerDesc.includes('pothole') || lowerDesc.includes('road')) {
        result = { issue_type: 'Road Issue', severity: 'Medium', department: 'Public Works', confidence: 0.92 };
    } else if (lowerDesc.includes('garbage') || lowerDesc.includes('waste') || lowerDesc.includes('dump')) {
        result = { issue_type: 'Sanitation Issue', severity: 'Low', department: 'Sanitation', confidence: 0.95 };
    } else if (lowerDesc.includes('accident') || lowerDesc.includes('emergency')) {
        result = { issue_type: 'Emergency', severity: 'Critical', department: 'General Administration', confidence: 0.98 };
    } else if (lowerDesc.includes('water') || lowerDesc.includes('leak')) {
        result = { issue_type: 'Water Supply Issue', severity: 'Medium', department: 'Water Authority', confidence: 0.90 };
    } else if (lowerDesc.includes('school') || lowerDesc.includes('education') || lowerDesc.includes('teacher') || lowerDesc.includes('books')) {
        result = { issue_type: 'Education Issue', severity: 'Medium', department: 'Education', confidence: 0.94 };
    } else if (lowerDesc.includes('hospital') || lowerDesc.includes('clinic') || lowerDesc.includes('health') || lowerDesc.includes('medical')) {
        result = { issue_type: 'Health Issue', severity: 'High', department: 'Health', confidence: 0.92 };
    }

    return result;
};
