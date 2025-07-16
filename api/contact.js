// api/contact.js
import { createClient } from '@supabase/supabase-js';

// Access Supabase environment variables from Vercel's configuration
// These should be set in your Vercel Project Settings > Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are properly loaded (important for debugging)
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('SERVERLESS FUNCTION ERROR: Missing Supabase environment variables!');
  // In a production app, you might want to throw an error or log more details
  // For now, this will appear in Vercel's Runtime Logs if configured incorrectly.
}

// Initialize Supabase client for server-side use with the Service Role Key
// The Service Role Key bypasses Row Level Security (RLS) for server-side inserts
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Important for serverless functions, no user session to persist
  },
});

export default async function handler(req, res) {
  // Ensure the request method is POST
  if (req.method === 'POST') {
    const { name, email, subject, message } = req.body;

    // Basic server-side validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are all required.' });
    }

    try {
      // Insert data into your 'contacts' table in Supabase
      const { data, error } = await supabase
        .from('contacts') // <<< Make sure 'contacts' is the exact name of your table!
        .insert([
          { name: name, email: email, subject: subject, message: message }
        ]);

      if (error) {
        console.error('Supabase insert error (from serverless function):', error);
        return res.status(500).json({ error: `Failed to save message to database: ${error.message}` });
      }

      console.log('Message successfully saved to Supabase:', data);
      return res.status(200).json({ message: 'Message sent successfully!' });

    } catch (unexpectedError) {
      console.error('An unexpected error occurred in serverless function:', unexpectedError);
      return res.status(500).json({ error: 'Internal server error occurred during form submission.' });
    }
  } else {
    // Handle any other HTTP methods (e.g., GET requests to /api/contact)
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}