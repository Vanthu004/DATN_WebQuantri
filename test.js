require('dotenv').config();

const mongoose = require('mongoose');
const supabase = require('./src/config/supabase');
const request = require('supertest');
const app = require('./app'); // Assuming main app file
const User = require('./src/models/user');
const Conversation = require('./src/models/Conversation');

describe('Chat Functionality Tests', () => {
  let userToken, staffToken, userId, staffId, conversationId, supabaseConvId;

  beforeAll(async () => {
    // Connect to test MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test users
    const user = await User.create({
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
      supabase_user_id: 'user-uuid-123',
    });
    const staff = await User.create({
      email: 'teststaff@example.com',
      password: 'password123',
      name: 'Test Staff',
      role: 'staff',
      supabase_user_id: 'staff-uuid-123',
    });

    userId = user._id;
    staffId = staff._id;

    // Mock auth tokens (assuming JWT or similar)
    userToken = 'mock-user-token';
    staffToken = 'mock-staff-token';

    // Setup Supabase mock
    jest.spyOn(supabase.from('conversations'), 'insert').mockReturnValue({
      select: () => ({
        data: [{ id: 'supabase-conv-123' }],
        error: null,
      }),
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await mongoose.connection.close();
    jest.restoreAllMocks();
  });

  test('Create conversation', async () => {
    const response = await request(app)
      .post('/api/chat/conversations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('conversationId');
    expect(response.body).toHaveProperty('supabaseId', 'supabase-conv-123');

    conversationId = response.body.conversationId;
    supabaseConvId = response.body.supabaseId;

    const conv = await Conversation.findById(conversationId);
    expect(conv).toBeTruthy();
    expect(conv.participants).toContainEqual(userId);
    expect(conv.participants).toContainEqual(staffId);
  });

  test('Send text message', async () => {
    jest.spyOn(supabase.from('messages'), 'insert').mockReturnValue({
      error: null,
    });

    const response = await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        conversationId,
        content: 'Hello, I need help!',
        type: 'text',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const conv = await Conversation.findById(conversationId);
    expect(conv.lastMessage).toBe('Hello, I need help!');
    expect(conv.lastMessageAt).toBeTruthy();
  });

  test('Get conversations', async () => {
    const response = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('participants');
    expect(response.body[0].participants.length).toBe(2);
  });

  test('Get messages', async () => {
    jest.spyOn(supabase.from('conversations'), 'select').mockReturnValue({
      data: [{ id: supabaseConvId }],
      error: null,
    });
    jest.spyOn(supabase.from('messages'), 'select').mockReturnValue({
      data: [{ id: 'msg-123', content: 'Hello', type: 'text', created_at: new Date() }],
      error: null,
    });

    const response = await request(app)
      .get(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('content', 'Hello');
  });

  test('Unauthorized access to conversation', async () => {
    const otherUser = await User.create({
      email: 'otheruser@example.com',
      password: 'password123',
      name: 'Other User',
      role: 'user',
      supabase_user_id: 'other-uuid-123',
    });

    const response = await request(app)
      .get(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer other-user-token`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Access denied');
  });
});