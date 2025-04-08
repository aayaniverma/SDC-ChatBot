// filepath: c:\Users\arukh\Desktop\sdc\SDC-ChatBot\pages\api\updateExcel.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';

interface FeedbackEntry {
  Timestamp: string;
  Question: string;
  Answer: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer, timestamp } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const filename = `not_helpful_${Date.now()}.xlsx`;
  const filePath = path.join(process.cwd(), 'public', 'feedback', filename);

  try {
    // Ensure the feedback directory exists
    const dir = path.join(process.cwd(), 'public', 'feedback');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create data with headers
    const data: FeedbackEntry[] = [{
      Timestamp: timestamp || new Date().toISOString(),
      Question: question,
      Answer: answer
    }];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ['Timestamp', 'Question', 'Answer']
    });

    // Add headers
    XLSX.utils.sheet_add_aoa(worksheet, [['Timestamp', 'Question', 'Answer']], { origin: 'A1' });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');

    // Write to file
    XLSX.writeFile(workbook, filePath);

    res.status(200).json({ 
      message: 'Feedback saved successfully',
      file: filename
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
}