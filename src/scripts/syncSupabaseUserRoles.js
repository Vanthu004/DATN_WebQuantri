// src/scripts/syncSupabaseUserRoles.js
require('dotenv').config();

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
const User = require('../models/user'); // Điều chỉnh đường dẫn nếu cần


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncSupabaseUserRoles() {
  try {
    const users = await User.find({});
    for (const user of users) {
      if (user.supabase_user_id) {
        const currentUser = await supabase.auth.admin.getUserById(user.supabase_user_id);
        const currentMetadata = currentUser.data.user?.user_metadata || {};
        const updatedMetadata = {
          ...currentMetadata,
          role: user.role,
          id: user._id.toString(),
          name: user.name
        };
        const { data, error } = await supabase.auth.admin.updateUserById(user.supabase_user_id, {
          user_metadata: updatedMetadata
        });
        if (error) {
          console.error(`Error updating role for user ${user.email}:`, error);
        } else {
          console.log(`Updated role for ${user.email}: ${user.role}`);
        }
      } else {
        console.warn(`No supabase_user_id for user: ${user.email}`);
      }
    }
    console.log('Role sync completed');
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

syncSupabaseUserRoles();