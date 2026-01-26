const chatService = require('../services/chat.service');

class ChatController {
    async getHistory(req, res) {
        try {
            const currentUserId = req.user.id;
            const { partnerId } = req.params; // Lấy ID người kia từ URL

            const messages = await chatService.getHistory(currentUserId, partnerId);
            return res.status(200).json(messages);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getConversations(req, res) {
        try {
            const currentUserId = req.user.id;
            const data = await chatService.getConversations(currentUserId);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // API: DELETE /api/chats/:conversationId
    async deleteConversation(req, res) {
        try {
            const currentUserId = req.user.id;
            const { conversationId } = req.params;
            await chatService.deleteConversation(conversationId, currentUserId);
            return res.status(200).json({ message: 'Đã xóa cuộc trò chuyện' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    async createGroup(req, res) {
        try {
            const creatorId = req.user.id;
            const { name, members } = req.body; // members là mảng ID
            if (!name || !members || members.length < 2) {
                return res.status(400).json({ message: 'Cần tên nhóm và ít nhất 2 thành viên khác.' });
            }
            const group = await chatService.createGroup(creatorId, name, members);
            return res.status(200).json(group);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // POST /api/chats/group/:id/members (Thêm mem)
    async addMembers(req, res) {
        try {
            const requesterId = req.user.id;
            const conversationId = req.params.id;
            const { members } = req.body;
            await chatService.addMembersToGroup(requesterId, conversationId, members);
            return res.status(200).json({ message: 'Đã thêm thành viên' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // GET /api/chats/group/:id/members (Lấy ds mem)
    async getMembers(req, res) {
        try {
            const members = await chatService.getGroupMembers(req.params.id);
            return res.status(200).json(members);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // DELETE /api/chats/group/:id/members/:userId (Xóa mem)
    async removeMember(req, res) {
        try {
            const requesterId = req.user.id;
            const { id: conversationId, userId } = req.params;
            await chatService.kickMember(requesterId, conversationId, userId);
            return res.status(200).json({ message: 'Đã xóa thành viên' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // DELETE /api/chats/group/:id (Giải tán)
    async disbandGroup(req, res) {
        try {
            const requesterId = req.user.id;
            await chatService.disbandGroup(requesterId, req.params.id);
            return res.status(200).json({ message: 'Đã giải tán nhóm' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // GET /api/chats/conversation/:conversationId/messages
    async getMessagesByConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const messages = await chatService.getMessagesByConversationId(conversationId);
            return res.status(200).json(messages);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ChatController();