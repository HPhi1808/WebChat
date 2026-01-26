// repositories/user.repository.js
const supabase = require('../config/supabase');

class UserRepository {
    async searchUsers(keyword) {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url') 
            .ilike('email', `%${keyword}%`)
            .limit(5);

        if (error) throw new Error(error.message);
        return data || []; // Trả về object user hoặc null
    }

    async findUserById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, role')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    async updateUserStatus(userId, isOnline) {
        const updateData = {
            is_online: isOnline,
            last_seen: new Date().toISOString()
        };

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId);
            
        if (error) console.error("Lỗi update status:", error.message);
    }
}

module.exports = new UserRepository();