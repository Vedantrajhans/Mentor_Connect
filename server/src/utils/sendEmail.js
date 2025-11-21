// src/utils/sendEmail.js
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  console.log('\nEMAIL (SIMULATED):');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:', html.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...');
  if (attachments.length > 0) {
    console.log('Attachments:', attachments.map(a => a.filename).join(', '));
  }
  console.log('---\n');
};