'use server';

import dbConnect from '@/src/lib/db';
import Complaint from '@/src/models/Complaint';
import { revalidatePath } from 'next/cache';

// Define the return type for the action
type ActionResponse = { success: boolean; error?: string };

export async function submitComplaint(formData: FormData, studentId: string): Promise<ActionResponse> {
  // 1. Connect to the Database
  await dbConnect();

  try {
    // 2. Extract Data from FormData
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    if (!title || !category || !description) {
      return { success: false, error: 'All fields are required.' };
    }

    // 3. Create the new Complaint instance
    const newComplaint = new Complaint({
      studentId: studentId, // Use the ID passed from the component
      title: title,
      category: category,
      description: description,
      status: 'Pending', // Default status
    });

    // 4. Save to MongoDB
    await newComplaint.save();
    
    // 5. Revalidate the Dashboard page to show the new complaint instantly
    revalidatePath('/student/dashboard');

    return { success: true };
    
  } catch (error) {
    console.error('SERVER ACTION ERROR:', error);
    return { success: false, error: 'Failed to save complaint due to a server error.' };
  }
}