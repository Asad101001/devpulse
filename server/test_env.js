import 'dotenv/config';
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Present' : 'Missing');
