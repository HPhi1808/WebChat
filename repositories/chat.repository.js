const supabase = require('../config/supabase');

class ChatRepository {
    // 1. Tìm xem 2 người đã có cuộc hội thoại 1-1 nào chưa
    async findPrivateConversationId(user1Id, user2Id) {
        // Lấy danh sách conversation PRIVATE của user 1
        const { data: list1, error: err1 } = await supabase
            .from('conversation_members')
            .select(`
                conversation_id,
                conversations!inner (type) 
            `)
            .eq('user_id', user1Id)
            .eq('conversations.type', 'private'); // <--- QUAN TRỌNG: Chỉ lấy loại private

        // Lấy danh sách conversation PRIVATE của user 2
        const { data: list2, error: err2 } = await supabase
            .from('conversation_members')
            .select(`
                conversation_id,
                conversations!inner (type)
            `)
            .eq('user_id', user2Id)
            .eq('conversations.type', 'private'); // <--- QUAN TRỌNG: Chỉ lấy loại private

        if (err1 || err2 || !list1 || !list2) return null;

        // Tìm conversation_id chung
        const ids1 = list1.map(i => i.conversation_id);
        const ids2 = list2.map(i => i.conversation_id);
        
        // Tìm ID chung đầu tiên
        const commonId = ids1.find(id => ids2.includes(id));
        
        return commonId || null;
    }

    // 2. Tạo cuộc hội thoại mới
    async createConversation(type = 'private') {
        const { data, error } = await supabase
            .from('conversations')
            .insert({ type: type })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    }

    // 3. Thêm thành viên vào cuộc hội thoại
    async addMember(conversationId, userId) {
        const { error } = await supabase
            .from('conversation_members')
            .insert({ conversation_id: conversationId, user_id: userId });
        if (error) throw new Error(error.message);
    }

    // 4. Lưu tin nhắn mới
    async saveMessage(conversationId, senderId, content, type = 'text', fileName = null, fileSize = null) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content: content,
                type: type,           // Lưu loại (image, video...)
                file_name: fileName,  // Lưu tên file gốc
                file_size: fileSize,  // Lưu kích thước
                status: 'sent'        // Mặc định là đã gửi
            })
            .select()
            .single();

        if (error) {
            console.error("Lỗi Save Message:", error.message);
            throw new Error(error.message);
        }
        return data;
    }

    async updateLastMessage(conversationId, messageId, createdAt) {
        const { error } = await supabase
            .from('conversations')
            .update({ 
                last_message_id: messageId,
                last_message_at: createdAt
            })
            .eq('id', conversationId);
            
        if (error) console.error("Lỗi update last message:", error.message);
    }

    // 5. Lấy lịch sử tin nhắn
    async getMessages(conversationId, limit = 50) {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:users(id, full_name, email, avatar_url)') // Join để lấy tên người gửi
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true }) // Cũ nhất ở trên
            .limit(limit);

        if (error) throw new Error(error.message);
        return data;
    }

    // Đánh dấu tin nhắn đã đọc
    async markMessagesAsRead(conversationId, currentUserId) {
        const { error } = await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId) // Chỉ update tin nhắn của người khác gửi
            .eq('status', 'sent'); // Chỉ update những tin chưa đọc

        if (error) console.error("Lỗi mark read:", error.message);
    }

    // 6. Lấy danh sách cuộc trò chuyện của User
    async getUserConversations(userId) {
        try {
            // Query từ conversation_members
            const { data, error } = await supabase
                .from('conversation_members')
                .select(`
                    role,
                    conversation:conversations (
                        id,
                        type,
                        name,
                        image_url,
                        last_message_at,
                        last_message:messages!last_message_id (
                            content,
                            type,
                            created_at,
                            sender_id
                        ),
                        members:conversation_members (
                            role,
                            user:users (
                                id,
                                full_name,
                                email,
                                avatar_url,
                                is_online,
                                last_seen
                            )
                        )
                    )
                `)
                .eq('user_id', userId);

            if (error) {
                // IN LỖI RA TERMINAL ĐỂ DEBUG
                console.error("Supabase Error tại getUserConversations:", error);
                throw new Error(error.message);
            }

            // Map dữ liệu
            return data.map(item => {
                const conv = item.conversation;
                if (!conv) return null;

                return {
                    ...conv,
                    my_role: item.role
                };
            }).filter(item => item !== null);

        } catch (err) {
            console.error("Lỗi System tại Repository:", err);
            throw err;
        }
    }

    // 7. Xóa cuộc trò chuyện (Rời khỏi nhóm / Xóa chat 1-1)
    async deleteConversation(conversationId, userId) {
        // Cách đơn giản nhất: Xóa user khỏi conversation_members
        // Khi user chat lại, logic cũ của bạn sẽ tự tạo conversation mới hoặc add lại
        const { error } = await supabase
            .from('conversation_members')
            .delete()
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);

        if (error) throw new Error(error.message);
        return true;
    }


    async createGroupConversation(name, creatorId) {
        // Tạo conversation type = 'group'
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                type: 'group',
                name: name,
                image_url: 'https://via.placeholder.com/150' // Ảnh mặc định
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    }

    // 2. Thêm 1 thành viên với role cụ thể
    async addMember(conversationId, userId, role = 'member') {
        const { error } = await supabase
            .from('conversation_members')
            .insert({
                conversation_id: conversationId,
                user_id: userId,
                role: role
            });
        if (error) throw new Error(error.message);
    }

    // 3. Thêm NHIỀU thành viên cùng lúc (Bulk insert)
    async addMembers(conversationId, userIds) {
        const rows = userIds.map(uid => ({
            conversation_id: conversationId,
            user_id: uid,
            role: 'member'
        }));
        
        const { error } = await supabase
            .from('conversation_members')
            .upsert(rows, { 
                onConflict: 'conversation_id, user_id', // Cột unique constraint
                ignoreDuplicates: true // Nếu trùng thì bỏ qua, không báo lỗi
            });

        if (error) throw new Error(error.message);
    }

    // 4. Lấy Role của user trong 1 group (để check quyền Admin)
    async getMemberRole(conversationId, userId) {
        const { data, error } = await supabase
            .from('conversation_members')
            .select('role')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;
        return data.role;
    }

    // 5. Lấy danh sách thành viên của Group (để hiển thị popup xóa)
    async getGroupMembers(conversationId) {
        const { data, error } = await supabase
            .from('conversation_members')
            .select(`
                user:users (id, full_name, email, avatar_url, is_online, last_seen), 
                role
            `) // ^^^ Đã thêm is_online và last_seen vào đây
            .eq('conversation_id', conversationId);
        if (error) throw new Error(error.message);
        return data;
    }

    // 6. Xóa thành viên khỏi nhóm
    async removeMember(conversationId, userId) {
        const { error } = await supabase
            .from('conversation_members')
            .delete()
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);
        if (error) throw new Error(error.message);
    }

    // 7. Giải tán nhóm (Xóa conversation) -> Dùng lại hàm deleteConversation cũ
    async deleteConversation(conversationId) {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId);
        if (error) throw new Error(error.message);
    }
}

module.exports = new ChatRepository();