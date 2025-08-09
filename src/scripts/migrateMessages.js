// src/scripts/migrateMessages.js - FIXED VERSION
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
const User = require('../models/user'); // ✅ FIX: Đường dẫn đúng

mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateMessages() {
  try {
    console.log('🚀 Bắt đầu migration messages...');
    
    // ✅ FIX: Lấy mapping từ MongoDB ID sang Supabase ID
    const users = await User.find({}, '_id supabase_user_id name');
    console.log(`📋 Tìm thấy ${users.length} users trong MongoDB`);
    
    // Tạo map: MongoDB ID -> Supabase ID
    const mongoToSupabaseMap = new Map();
    const supabaseToMongoMap = new Map();
    
    users.forEach(user => {
      if (user.supabase_user_id) {
        mongoToSupabaseMap.set(user._id.toString(), user.supabase_user_id);
        supabaseToMongoMap.set(user.supabase_user_id, {
          mongoId: user._id.toString(),
          name: user.name
        });
      }
    });
    
    console.log(`🔗 Tạo mapping cho ${mongoToSupabaseMap.size} users`);

    // Lấy tất cả messages từ Supabase
    let { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Lỗi khi lấy messages:', error);
      throw error;
    }

    console.log(`📨 Tìm thấy ${messages.length} messages cần migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const message of messages) {
      try {
        const senderMongoId = message.sender_id;
        const receiverMongoId = message.receiver_id;

        // Kiểm tra xem có phải đã là Supabase UUID chưa
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (isUUID.test(senderMongoId) && isUUID.test(receiverMongoId)) {
          console.log(`⏭️  Message ${message.id} đã được migrate, bỏ qua`);
          skippedCount++;
          continue;
        }

        // Chuyển đổi từ MongoDB ID sang Supabase ID
        const senderSupabaseId = mongoToSupabaseMap.get(senderMongoId);
        const receiverSupabaseId = mongoToSupabaseMap.get(receiverMongoId);

        if (!senderSupabaseId || !receiverSupabaseId) {
          console.log(`⚠️  Không tìm thấy Supabase ID cho message ${message.id}:`);
          console.log(`   Sender: ${senderMongoId} -> ${senderSupabaseId}`);
          console.log(`   Receiver: ${receiverMongoId} -> ${receiverSupabaseId}`);
          skippedCount++;
          continue;
        }

        // ✅ FIX: Update message với Supabase IDs và thông tin bổ sung
        const senderInfo = supabaseToMongoMap.get(senderSupabaseId);
        
        const { error: updateError } = await supabase
          .from('messages')
          .update({ 
            sender_id: senderSupabaseId,
            receiver_id: receiverSupabaseId,
            sender_name: message.sender_name || senderInfo?.name || 'Unknown',
            // Giữ nguyên các field khác
          })
          .eq('id', message.id);

        if (updateError) {
          console.error(`❌ Error updating message ${message.id}:`, updateError);
          skippedCount++;
        } else {
          console.log(`✅ Migrated message ${message.id}: ${senderMongoId} -> ${senderSupabaseId}`);
          migratedCount++;
        }
      } catch (msgError) {
        console.error(`❌ Error processing message ${message.id}:`, msgError);
        skippedCount++;
      }
    }

    console.log('\n🎉 Migration hoàn thành!');
    console.log(`✅ Migrated: ${migratedCount} messages`);
    console.log(`⏭️  Skipped: ${skippedCount} messages`);
    
  } catch (error) {
    console.error('💥 Migration error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy migration
migrateMessages();