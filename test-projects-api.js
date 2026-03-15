// Quick test to verify projects API returns data
const fetch = require('node:fetch');

async function testProjectsAPI() {
  try {
    console.log('Testing /api/projects endpoint...\n');

    const response = await fetch('https://onekof.com/api/projects', {
      headers: {
        'Cookie': 'your-session-cookie-here' // You'll need to replace this
      }
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Projects Count:', data.projects?.length || 0);
    console.log('\nProjects:', JSON.stringify(data.projects, null, 2));

    if (data.projects && data.projects.length > 0) {
      console.log('\n✅ API is returning projects!');
      console.log('Sample project:', data.projects[0].name);
    } else {
      console.log('\n❌ API returned empty projects array');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProjectsAPI();
