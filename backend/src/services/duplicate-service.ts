// This is a simplified cosine similarity implementation
// In a real production app, we would use a proper embedding model (Gemini/OpenAI) 
// and a vector database (MongoDB Atlas Search or Pinecone).

export const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity as a proxy
};

export const findDuplicateComplaint = async (newDescription: string, existingComplaints: any[]): Promise<any | null> => {
    const THRESHOLD = 0.85;

    for (const complaint of existingComplaints) {
        const similarity = calculateSimilarity(newDescription, complaint.description);
        if (similarity > THRESHOLD) {
            return complaint;
        }
    }

    return null;
};
