const chatRepository = require('../repositories/chat.repository');

class ChatService {

    // Hàm quan trọng nhất: Gửi tin nhắn 1-1
    async sendMessage1on1(senderId, receiverId, content, type, fileName = null, fileSize = null) {
        let conversationId = await chatRepository.findPrivateConversationId(senderId, receiverId);

        if (!conversationId) {
            const newConv = await chatRepository.createConversation('private');
            conversationId = newConv.id;
            await Promise.all([
                chatRepository.addMember(conversationId, senderId),
                chatRepository.addMember(conversationId, receiverId)
            ]);
        }

        // Gọi saveMessage với đúng 6 tham số
        const message = await chatRepository.saveMessage(conversationId, senderId, content, type, fileName, fileSize);
        
        await chatRepository.updateLastMessage(conversationId, message.id, message.created_at);
        return message;
    }

    async sendMessageToGroup(conversationId, senderId, content, type, fileName = null, fileSize = null) {
        // Gọi saveMessage với đúng 6 tham số
        const message = await chatRepository.saveMessage(conversationId, senderId, content, type, fileName, fileSize);
        
        await chatRepository.updateLastMessage(conversationId, message.id, message.created_at);
        return message;
    }

    // Lấy lịch sử chat
    async getHistory(user1, user2) {
        const conversationId = await chatRepository.findPrivateConversationId(user1, user2);
        if (!conversationId) return [];
        return await chatRepository.getMessages(conversationId);
    }

    async createGroup(creatorId, groupName, memberIds) {
        // Tạo Conversation
        const group = await chatRepository.createGroupConversation(groupName, creatorId);

        // Thêm Creator làm ADMIN
        await chatRepository.addMember(group.id, creatorId, 'admin');

        // Thêm các thành viên khác
        if (memberIds && memberIds.length > 0) {
            await chatRepository.addMembers(group.id, memberIds);
        }

        return group;
    }

    // 2. Thêm thành viên (Chỉ Admin)
    async addMembersToGroup(requesterId, conversationId, newMemberIds) {
        const role = await chatRepository.getMemberRole(conversationId, requesterId);
        if (role !== 'admin') throw new Error('Chỉ Admin mới có quyền thêm thành viên');

        await chatRepository.addMembers(conversationId, newMemberIds);
    }

    // 3. Xóa thành viên (Chỉ Admin)
    async kickMember(requesterId, conversationId, targetUserId) {
        const role = await chatRepository.getMemberRole(conversationId, requesterId);
        if (role !== 'admin') throw new Error('Chỉ Admin mới có quyền xóa thành viên');

        await chatRepository.removeMember(conversationId, targetUserId);
    }

    // 4. Lấy danh sách thành viên (Cho popup quản lý)
    async getGroupMembers(conversationId) {
        return await chatRepository.getGroupMembers(conversationId);
    }

    // 5. Giải tán nhóm (Chỉ Admin)
    async disbandGroup(requesterId, conversationId) {
        const role = await chatRepository.getMemberRole(conversationId, requesterId);
        if (role !== 'admin') throw new Error('Chỉ Admin mới có quyền giải tán nhóm');

        await chatRepository.deleteConversation(conversationId);
    }

    // Lấy danh sách cuộc trò chuyện của user
    async getConversations(currentUserId) {
        let conversations = await chatRepository.getUserConversations(currentUserId);

        const formatted = conversations.map(conv => {
            let displayName = conv.name;
            let displayImage = conv.image_url;
            let partnerId = null;
            let isOnline = false;
            let lastSeen = null;

            // 1. LẤY ROLE CỦA MÌNH (Đã có sẵn từ Repository)
            const myRole = conv.my_role || 'member';

            // 2. XỬ LÝ HIỂN THỊ (Private Chat)
            if (conv.type === 'private') {
                // Tìm người kia để lấy tên và avatar
                const partnerMember = conv.members.find(m => m.user.id !== currentUserId);

                if (partnerMember && partnerMember.user) {
                    displayName = partnerMember.user.full_name || partnerMember.user.email;
                    displayImage = partnerMember.user.avatar_url;
                    partnerId = partnerMember.user.id;
                    isOnline = partnerMember.user.is_online;
                    lastSeen = partnerMember.user.last_seen;
                } else {
                    displayName = "Người dùng ẩn";
                }
            }

            return {
                conversation_id: conv.id,
                type: conv.type,
                display_name: displayName,
                avatar_url: displayImage,
                last_message: conv.last_message,
                last_message_at: conv.last_message_at,

                partner_id: partnerId,
                is_online: isOnline,
                last_seen: lastSeen,

                my_role: myRole // Trả về cho Client
            };
        });

        // Sắp xếp tin nhắn mới nhất lên đầu
        formatted.sort((a, b) => {
            return new Date(b.last_message_at) - new Date(a.last_message_at);
        });

        return formatted;
    }

    async getGroupMemberIds(conversationId) {
        // 1. Gọi Repository để lấy danh sách thành viên đầy đủ
        const members = await chatRepository.getGroupMembers(conversationId);
        
        // 2. Map ra mảng chỉ chứa ID để trả về cho Socket
        // Kết quả: ['uuid-1', 'uuid-2', ...]
        return members.map(m => m.user.id);
    }

    async getMessagesByConversationId(conversationId) {
        return await chatRepository.getMessages(conversationId);
    }

    async deleteConversation(conversationId, userId) {
        return await chatRepository.deleteConversation(conversationId, userId);
    }

    async markConversationAsRead(conversationId, readerId) {
        await chatRepository.markMessagesAsRead(conversationId, readerId);
    }
}

module.exports = new ChatService();