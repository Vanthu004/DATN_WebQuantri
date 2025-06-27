// Test route update-profile thực tế
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODVjYTEwYzQwOTY3MThjZmJkZWQwZWMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc1MDkwMTcwNiwiZXhwIjoxNzUwOTg4MTA2fQ.lWO2aEUkUZyO02N-KhYePdtPJPSEWKEp4tvLPLjUunU';

async function testUpdateProfileRoute() {
  try {
    console.log('🔧 Testing update profile route...');
    
    const requestData = {
      email: 'lythu2k4lc@gmail.com',
      gender: 'male',
      name: 'Văn thưok',
      phone_number: ''
    };
    
    console.log('📝 Request data:', JSON.stringify(requestData, null, 2));
    console.log('🌐 Making request to:', `${BASE_URL}/users/update-profile`);
    
    const response = await axios.put(`${BASE_URL}/users/update-profile`, requestData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success!');
    console.log('📊 Status:', response.status);
    console.log('📤 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📤 Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
testUpdateProfileRoute(); 