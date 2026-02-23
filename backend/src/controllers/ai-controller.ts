import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeImage = async (req: Request, res: Response) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: 'imageBase64 is required' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.status(200).json({
                title: '',
                description: '',
                category: '',
                department: '',
                error: 'GEMINI_API_KEY not configured — AI auto-fill unavailable'
            });
        }

        // Strip data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an AI assistant for a civic complaint system in India called JanConnect.
Analyze this image and identify the civic issue shown.

Return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "title": "Short, specific complaint title (max 60 chars)",
  "description": "Detailed description of the problem visible in the image (2-3 sentences)",
  "category": "One of: Road & Infrastructure, Water Supply, Electricity, Sanitation & Waste, Public Safety, Parks & Environment, Other",
  "department": "One of: Roads Department, Water Works, Electricity Board, Sanitation Department, Police, Parks Department, Municipal Corporation"
}

Examples:
- Pothole → title: "Large pothole causing road hazard", department: "Roads Department"
- Broken streetlight → title: "Street light not working", department: "Electricity Board"
- Garbage pile → title: "Garbage pile not collected", department: "Sanitation Department"`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                }
            }
        ]);

        const text = result.response.text().trim();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res.status(200).json({ title: '', description: '', category: '', department: '', error: 'Could not parse AI response' });
        }

        const parsed = JSON.parse(jsonMatch[0]);
        res.status(200).json(parsed);
    } catch (error: any) {
        console.error('[AI] Image analysis error:', error.message);
        res.status(200).json({ title: '', description: '', category: '', department: '', error: error.message });
    }
};
