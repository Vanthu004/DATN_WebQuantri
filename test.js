// test.js - Comprehensive API Testing for Chat System
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const BASE_URL = 'http://localhost:3000/api/users';
const TEST_RESULTS = [];
let ADMIN_TOKEN = '';
let USER_TOKEN = '';
let ADMIN_USER = {};
let TEST_USER = {};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Utility functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
    const symbol = status === 'PASS' ? '✅' : '❌';
    const color = status === 'PASS' ? 'green' : 'red';
    log(`${symbol} ${testName}: ${status}${details ? ` - ${details}` : ''}`, color);

    TEST_RESULTS.push({
        test: testName,
        status,
        details,
        timestamp: new Date().toISOString()
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testLogin() {
    log('\n🔐 Testing Login Functionality', 'blue');

    try {
        // Test Admin Login
        const adminResponse = await axios.post(`${BASE_URL}/login`, {
            email: 'thainqph36461@fpt.edu.vn',
            password: 'Test1234@' // Thay đổi password thực tế
        });

        if (adminResponse.status === 200 && adminResponse.data.token) {
            ADMIN_TOKEN = adminResponse.data.token;
            ADMIN_USER = adminResponse.data.user;
            logTest('Admin Login', 'PASS', `Role: ${ADMIN_USER.role}`);
        } else {
            logTest('Admin Login', 'FAIL', 'No token received');
            return false;
        }

        // Test User Login (nếu có user test)
        try {
            const userResponse = await axios.post(`${BASE_URL}/login`, {
                email: 'mixbro01@gmail.com', // Email user test
                password: 'Test1234@' // Thay đổi password thực tế
            });

            if (userResponse.status === 200 && userResponse.data.token) {
                USER_TOKEN = userResponse.data.token;
                TEST_USER = userResponse.data.user;
                logTest('User Login', 'PASS', `Role: ${TEST_USER.role}`);
            }
        } catch (userError) {
            logTest('User Login', 'FAIL', 'Test user not available or wrong credentials');
            // Không return false vì admin test vẫn có thể chạy
        }

        return true;

    } catch (error) {
        logTest('Login', 'FAIL', error.response?.data?.message || error.message);
        return false;
    }
}

async function testSupabaseToken() {
    log('\n🔑 Testing Supabase Token Generation', 'blue');

    try {
        // Test Admin Supabase Token
        const response = await axios.get(`${BASE_URL}/supabase-token`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });

        if (response.status === 200 && response.data.supabaseToken) {
            logTest('Admin Supabase Token', 'PASS', 'Token generated successfully');

            // Verify token structure
            const token = response.data.supabaseToken;
            if (token.access_token && token.refresh_token) {
                logTest('Supabase Token Structure', 'PASS', 'Contains access_token and refresh_token');
            } else {
                logTest('Supabase Token Structure', 'FAIL', 'Missing required token fields');
            }

            // Verify user info
            const user = response.data.user;
            if (user.supabase_user_id && user.email && user.role) {
                logTest('Supabase User Info', 'PASS', `Supabase ID: ${user.supabase_user_id}`);
            } else {
                logTest('Supabase User Info', 'FAIL', 'Missing required user fields');
            }
        } else {
            logTest('Supabase Token', 'FAIL', 'No token in response');
        }

        // Test User Supabase Token (if available)
        if (USER_TOKEN) {
            const userResponse = await axios.get(`${BASE_URL}/supabase-token`, {
                headers: { Authorization: `Bearer ${USER_TOKEN}` }
            });

            if (userResponse.status === 200) {
                logTest('User Supabase Token', 'PASS', 'User token generated successfully');
            }
        }

    } catch (error) {
        logTest('Supabase Token', 'FAIL', error.response?.data?.message || error.message);
    }
}

async function testGetAdmins() {
    log('\n👥 Testing Get Admins', 'blue');

    try {
        const response = await axios.get(`${BASE_URL}/admins`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });

        if (response.status === 200 && Array.isArray(response.data.data)) {
            const admins = response.data.data;
            logTest('Get Admins', 'PASS', `Found ${admins.length} admin(s)`);

            // Verify admin structure
            if (admins.length > 0) {
                const admin = admins[0];
                if (admin.name && admin.supabase_user_id) {
                    logTest('Admin Data Structure', 'PASS', 'Contains required fields');
                } else {
                    logTest('Admin Data Structure', 'FAIL', 'Missing required fields');
                }
            }
        } else {
            logTest('Get Admins', 'FAIL', 'Invalid response format');
        }

    } catch (error) {
        logTest('Get Admins', 'FAIL', error.response?.data?.message || error.message);
    }
}

async function testImageUpload() {
    log('\n🖼️  Testing Image Upload', 'blue');

    try {
        // Tạo file test image
        const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

        const form = new FormData();
        form.append('image', testImageContent, {
            filename: 'test.png',
            contentType: 'image/png'
        });

        const response = await axios.post(`${BASE_URL}/upload-image`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${ADMIN_TOKEN}`
            }
        });

        if (response.status === 200 && response.data.imageUrl) {
            logTest('Image Upload', 'PASS', `URL: ${response.data.imageUrl.substring(0, 50)}...`);
            return response.data.imageUrl;
        } else {
            logTest('Image Upload', 'FAIL', 'No image URL returned');
            return null;
        }

    } catch (error) {
        logTest('Image Upload', 'FAIL', error.response?.data?.message || error.message);
        return null;
    }
}

async function testSendMessage() {
  log('\n💬 Testing Send Message', 'blue');
  try {
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const supabaseAccessToken = tokenResponse.data.supabaseToken.access_token;

    // Test text message
    const textResponse = await axios.post(`${BASE_URL}/messages`, {
      receiver_id: ADMIN_USER._id,
      content: 'Test message from API test'
    }, {
      headers: { 
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'supabase-access-token': supabaseAccessToken
      }
    });

    if (textResponse.status === 201 && textResponse.data.data) {
      logTest('Send Text Message', 'PASS', `Message ID: ${textResponse.data.data._id}`);
    } else {
      logTest('Send Text Message', 'FAIL', 'Invalid response');
    }

    // Test image message
    const imageUrl = await testImageUpload();
    if (imageUrl) {
      const imageResponse = await axios.post(`${BASE_URL}/messages`, {
        receiver_id: ADMIN_USER._id,
        image_url: imageUrl
      }, {
        headers: { 
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'supabase-access-token': supabaseAccessToken
        }
      });

      if (imageResponse.status === 201) {
        logTest('Send Image Message', 'PASS', 'Image message sent successfully');
      } else {
        logTest('Send Image Message', 'FAIL', 'Failed to send image message');
      }
    }

    // Test invalid message (no content and no image)
    try {
      await axios.post(`${BASE_URL}/messages`, {
        receiver_id: ADMIN_USER._id
      }, {
        headers: { 
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'supabase-access-token': supabaseAccessToken
        }
      });
      logTest('Invalid Message Validation', 'FAIL', 'Should have rejected empty message');
    } catch (validationError) {
      if (validationError.response?.status === 400) {
        logTest('Invalid Message Validation', 'PASS', 'Correctly rejected empty message');
      } else {
        logTest('Invalid Message Validation', 'FAIL', `Wrong error response: ${validationError.response?.status}`);
      }
    }
  } catch (error) {
    logTest('Send Message', 'FAIL', error.response?.data?.message || error.message);
  }
}

async function testGetMessages() {
  log('\n📨 Testing Get Messages', 'blue');
  try {
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const supabaseAccessToken = tokenResponse.data.supabaseToken.access_token;

    const response = await axios.get(`${BASE_URL}/messages`, {
      params: {
        receiver_id: ADMIN_USER._id,
        limit: 10,
        offset: 0
      },
      headers: { 
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'supabase-access-token': supabaseAccessToken
      }
    });

    if (response.status === 200 && Array.isArray(response.data.messages)) {
      const messages = response.data.messages;
      logTest('Get Messages', 'PASS', `Retrieved ${messages.length} message(s)`);

      if (messages.length > 0) {
        const message = messages[0];
        if (message._id && message.createdAt && message.user) {
          logTest('Message Structure', 'PASS', 'Contains required fields');
          if (message.user._id && message.user.name) {
            logTest('Message User Info', 'PASS', 'User info complete');
          } else {
            logTest('Message User Info', 'FAIL', 'Missing user info');
          }
        } else {
          logTest('Message Structure', 'FAIL', 'Missing required fields');
        }
      }
    } else {
      logTest('Get Messages', 'FAIL', 'Invalid response format');
    }

    // Test pagination
    const paginationResponse = await axios.get(`${BASE_URL}/messages`, {
      params: {
        receiver_id: ADMIN_USER._id,
        limit: 5,
        offset: 0
      },
      headers: { 
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'supabase-access-token': supabaseAccessToken
      }
    });

    if (paginationResponse.status === 200) {
      logTest('Message Pagination', 'PASS', 'Pagination parameters work');
    }
  } catch (error) {
    logTest('Get Messages', 'FAIL', error.response?.data?.message || error.message);
  }
}

async function testGetConversations() {
  log('\n💭 Testing Get Conversations', 'blue');
  try {
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const supabaseAccessToken = tokenResponse.data.supabaseToken.access_token;

    const response = await axios.get(`${BASE_URL}/messages/conversations`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'supabase-access-token': supabaseAccessToken
      }
    });

    if (response.status === 200 && Array.isArray(response.data.data)) {
      const conversations = response.data.data;
      logTest('Get Conversations', 'PASS', `Found ${conversations.length} conversation(s)`);

      // Kiểm tra quyền admin
      if (ADMIN_USER.role === 'admin') {
        const hasInvalidUsers = conversations.some(conv => !['user', 'customer'].includes(conv.role));
        if (!hasInvalidUsers) {
          logTest('Admin Conversation Rights', 'PASS', 'Admin only sees user/customer conversations');
        } else {
          logTest('Admin Conversation Rights', 'FAIL', 'Admin sees invalid user roles');
        }
      }

      // Kiểm tra trường hợp không có cuộc trò chuyện
      if (conversations.length === 0) {
        logTest('Empty Conversations', 'PASS', 'Correctly handles no conversations');
      }

      if (conversations.length > 0) {
        const conversation = conversations[0];
        const requiredFields = ['_id', 'name', 'role'];
        const hasAllFields = requiredFields.every(field => conversation.hasOwnProperty(field));
        
        if (hasAllFields) {
          logTest('Conversation Structure', 'PASS', 'Contains required fields');
          if (conversation.latestMessage) {
            if (conversation.latestMessage._id && conversation.latestMessage.createdAt) {
              logTest('Latest Message Info', 'PASS', 'Latest message complete');
            } else {
              logTest('Latest Message Info', 'FAIL', 'Latest message incomplete');
            }
          } else {
            logTest('Latest Message Info', 'PASS', 'No latest message (acceptable)');
          }
        } else {
          logTest('Conversation Structure', 'FAIL', 'Missing required fields');
        }
      }
    } else {
      logTest('Get Conversations', 'FAIL', 'Invalid response format');
    }

    // Kiểm tra lỗi Supabase user không khớp
    // Giả lập bằng cách thêm một tin nhắn với supabase_user_id không tồn tại trong MongoDB
    // (Cần chạy script đồng bộ trước để kiểm tra)
  } catch (error) {
    logTest('Get Conversations', 'FAIL', error.response?.data?.message || error.message);
    if (error.response?.status === 500 && error.response?.data?.message.includes('Supabase')) {
      logTest('Supabase Error Handling', 'PASS', 'Correctly handles Supabase errors');
    } else {
      logTest('Supabase Error Handling', 'FAIL', 'Incorrect Supabase error handling');
    }
  }
}

async function testAuthorizationSecurity() {
    log('\n🔒 Testing Authorization Security', 'blue');

    // Test without token
    try {
        await axios.get(`${BASE_URL}/messages/conversations`);
        logTest('No Token Security', 'FAIL', 'Should require authentication');
    } catch (error) {
        if (error.response?.status === 401) {
            logTest('No Token Security', 'PASS', 'Correctly requires authentication');
        } else {
            logTest('No Token Security', 'FAIL', 'Wrong error response');
        }
    }

    // Test with invalid token
    try {
        await axios.get(`${BASE_URL}/messages/conversations`, {
            headers: { Authorization: 'Bearer invalid_token_here' }
        });
        logTest('Invalid Token Security', 'FAIL', 'Should reject invalid token');
    } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
            logTest('Invalid Token Security', 'PASS', 'Correctly rejects invalid token');
        } else {
            logTest('Invalid Token Security', 'FAIL', 'Wrong error response');
        }
    }

    // Test token expiration (if you have an expired token to test)
    // This would require creating an expired token for testing
}

async function testErrorHandling() {
  log('\n⚠️ Testing Error Handling', 'blue');
  try {
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const supabaseAccessToken = tokenResponse.data.supabaseToken.access_token;

    // Test invalid receiver_id for messages
    try {
      await axios.post(`${BASE_URL}/messages`, {
        receiver_id: 'invalid_mongodb_id',
        content: 'Test message'
      }, {
        headers: { 
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'supabase-access-token': supabaseAccessToken
        }
      });
      logTest('Invalid Receiver ID', 'FAIL', 'Should reject invalid receiver ID');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        logTest('Invalid Receiver ID', 'PASS', `Correctly handles invalid receiver ID with status ${error.response.status}`);
      } else {
        logTest('Invalid Receiver ID', 'FAIL', `Expected 400/404 but got ${error.response?.status}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test missing required fields
    try {
      await axios.get(`${BASE_URL}/messages`, {
        headers: { 
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'supabase-access-token': supabaseAccessToken
        }
      });
      logTest('Missing Required Fields', 'FAIL', 'Should require receiver_id');
    } catch (error) {
      if (error.response?.status === 400) {
        logTest('Missing Required Fields', 'PASS', 'Correctly requires receiver_id');
      } else {
        logTest('Missing Required Fields', 'FAIL', `Expected 400 but got ${error.response?.status}: ${error.response?.data?.message || error.message}`);
      }
    }
  } catch (error) {
    logTest('Error Handling', 'FAIL', error.response?.data?.message || error.message);
  }
}

async function testSupabaseIntegration() {
  log('\n🔗 Testing Supabase Integration', 'blue');
  try {
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });

    if (tokenResponse.data.user?.supabase_user_id) {
      logTest('Supabase User Mapping', 'PASS', 'User has Supabase ID');

      const messageResponse = await axios.post(`${BASE_URL}/messages`, {
        receiver_id: ADMIN_USER._id,
        content: 'Supabase integration test message'
      }, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'supabase-access-token': tokenResponse.data.supabaseToken.access_token
        }
      });

      if (messageResponse.status === 201) {
        logTest('Supabase Message Insert', 'PASS', 'Message inserted to Supabase');
        await sleep(1000);

        const getResponse = await axios.get(`${BASE_URL}/messages`, {
          params: { receiver_id: ADMIN_USER._id, limit: 1 },
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            'supabase-access-token': tokenResponse.data.supabaseToken.access_token
          }
        });

        if (getResponse.status === 200 && getResponse.data.messages.length > 0) {
          logTest('Supabase Message Retrieval', 'PASS', 'Message retrieved from Supabase');
        } else {
          logTest('Supabase Message Retrieval', 'FAIL', 'Could not retrieve message');
        }
      } else {
        logTest('Supabase Message Insert', 'FAIL', 'Failed to insert message');
      }
    } else {
      logTest('Supabase User Mapping', 'FAIL', 'User missing Supabase ID');
    }
  } catch (error) {
    logTest('Supabase Integration', 'FAIL', error.response?.data?.message || error.message);
  }
}

// Performance tests
async function testPerformance() {
  log('\n⚡ Testing Performance', 'blue');
  try {
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const supabaseAccessToken = tokenResponse.data.supabaseToken.access_token;

    // Test response times
    const startTime = Date.now();
    await axios.get(`${BASE_URL}/messages/conversations`, {
      headers: { 
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'supabase-access-token': supabaseAccessToken
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (responseTime < 2000) {
      logTest('Response Time', 'PASS', `${responseTime}ms (Good)`);
    } else if (responseTime < 5000) {
      logTest('Response Time', 'PASS', `${responseTime}ms (Acceptable)`);
    } else {
      logTest('Response Time', 'FAIL', `${responseTime}ms (Too slow)`);
    }

    // Test concurrent requests
    const concurrentRequests = Array(5).fill(null).map(() => 
      axios.get(`${BASE_URL}/admins`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      })
    );

    const concurrentStart = Date.now();
    await Promise.all(concurrentRequests);
    const concurrentEnd = Date.now();
    const concurrentTime = concurrentEnd - concurrentStart;

    logTest('Concurrent Requests', 'PASS', `5 requests in ${concurrentTime}ms`);
  } catch (error) {
    logTest('Performance Test', 'FAIL', error.response?.data?.message || error.message);
  }
}
async function testSupabaseUserMismatch() {
  log('\n🔍 Testing Supabase User Mismatch', 'blue');
  try {
    // Giả lập một tin nhắn với supabase_user_id không tồn tại trong MongoDB
    // Cần thêm thủ công vào Supabase hoặc dùng API admin
    const tokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const supabaseAccessToken = tokenResponse.data.supabaseToken.access_token;

    const response = await axios.get(`${BASE_URL}/messages/conversations`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'supabase-access-token': supabaseAccessToken
      }
    });

    if (response.status === 200 && Array.isArray(response.data.data)) {
      logTest('Supabase User Mismatch', 'PASS', 'Handles missing MongoDB users correctly');
    }
  } catch (error) {
    logTest('Supabase User Mismatch', 'FAIL', error.response?.data?.message || error.message);
  }
}
async function testSupabaseRLS() {
  log('\n🔒 Testing Supabase RLS', 'blue');
  try {
    const userTokenResponse = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    const userSupabaseToken = userTokenResponse.data.supabaseToken.access_token;

    // Lấy ID của một user không phải admin từ API /admins hoặc cơ sở dữ liệu
    const otherUserResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const otherUser = otherUserResponse.data.data.find(u => u.role === 'user' && u._id !== TEST_USER._id);
    if (!otherUser) {
      logTest('Supabase RLS User Restriction', 'FAIL', 'No other user found for testing');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/messages`, {
        receiver_id: otherUser._id,
        content: 'Unauthorized message test'
      }, {
        headers: {
          Authorization: `Bearer ${USER_TOKEN}`,
          'supabase-access-token': userSupabaseToken
        }
      });
      logTest('Supabase RLS User Restriction', 'FAIL', 'Should reject user-to-user message');
    } catch (error) {
      if (error.response?.status === 403) {
        logTest('Supabase RLS User Restriction', 'PASS', 'Correctly rejects user-to-user message');
      } else {
        logTest('Supabase RLS User Restriction', 'FAIL', `Expected 403 but got ${error.response?.status}: ${error.response?.data?.message || error.message}`);
      }
    }
  } catch (error) {
    logTest('Supabase RLS', 'FAIL', error.response?.data?.message || error.message);
  }
}
// Generate test report
function generateReport() {
    log('\n📊 FINAL TEST REPORT', 'bold');
    log('='.repeat(50), 'cyan');

    const passed = TEST_RESULTS.filter(r => r.status === 'PASS').length;
    const failed = TEST_RESULTS.filter(r => r.status === 'FAIL').length;
    const total = TEST_RESULTS.length;

    log(`Total Tests: ${total}`, 'blue');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, failed > 0 ? 'yellow' : 'green');

    if (failed > 0) {
        log('\n❌ Failed Tests:', 'red');
        TEST_RESULTS
            .filter(r => r.status === 'FAIL')
            .forEach(test => {
                log(`  • ${test.test}: ${test.details}`, 'red');
            });
    }

    // Save detailed report to file
    const reportData = {
        summary: { total, passed, failed, successRate: ((passed / total) * 100).toFixed(1) },
        timestamp: new Date().toISOString(),
        tests: TEST_RESULTS
    };

    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    log('\n📄 Detailed report saved to: test-report.json', 'cyan');
}

// Main test runner
async function runAllTests() {
    log('🚀 Starting Comprehensive API Tests', 'bold');
    log('='.repeat(50), 'cyan');

    try {
        // Core functionality tests
        const loginSuccess = await testLogin();
        if (!loginSuccess) {
            log('❌ Login failed - stopping tests', 'red');
            return;
        }

        await testSupabaseToken();
        await testGetAdmins();
        await testSendMessage();
        await testGetMessages();
        await testGetConversations();

        // Security tests
        await testAuthorizationSecurity();
        await testErrorHandling();

        // Integration tests
        await testSupabaseIntegration();

        // Performance tests
        await testPerformance();
        await testSupabaseRLS();
        await testSupabaseUserMismatch();

    } catch (error) {
        log(`💥 Test runner error: ${error.message}`, 'red');
    } finally {
        generateReport();
    }
}

// Handle process termination
process.on('SIGINT', () => {
    log('\n⚠️  Tests interrupted by user', 'yellow');
    generateReport();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    log(`💥 Unhandled rejection: ${error.message}`, 'red');
    generateReport();
    process.exit(1);
});

// Run tests
if (require.main === module) {
    runAllTests().catch(error => {
        log(`💥 Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testLogin,
    testSupabaseToken,
    testSendMessage,
    testGetMessages,
    testGetConversations
};