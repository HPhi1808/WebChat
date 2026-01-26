const chatService = require('../services/chat.service');

module.exports = (io, socket, userSocketMap) => {

    // Sự kiện: Client gửi tin nhắn lên
    socket.on('send_message', async (payload) => {
        const { receiverId, conversationId, content, type, fileName, fileSize, chatType } = payload;
        const senderId = socket.user.id;

        try {
            let savedMessage = null;
            let targetSocketIds = new Set();

            if (chatType === 'group') {
                
                savedMessage = await chatService.sendMessageToGroup(conversationId, senderId, content, type, fileName, fileSize);

                const memberIds = await chatService.getGroupMemberIds(conversationId);
                memberIds.forEach(mId => {
                    if (mId !== senderId) {
                        const sockets = userSocketMap.get(mId);
                        if (sockets) sockets.forEach(s => targetSocketIds.add(s));
                    }
                });
            } 
            
            // CHAT PRIVATE
            else { 
                // Lưu tin nhắn: Vẫn truyền 'type' (image/file...) vào service
                savedMessage = await chatService.sendMessage1on1(senderId, receiverId, content, type, fileName, fileSize);

                const sockets = userSocketMap.get(receiverId);
                if (sockets) sockets.forEach(s => targetSocketIds.add(s));
            }

            targetSocketIds.forEach(socketId => {
                io.to(socketId).emit('receive_message', savedMessage);
            });

            socket.emit('message_sent_success', savedMessage);

        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            socket.emit('message_error', { error: 'Gửi tin thất bại' });
        }
    });

    // Sự kiện: Typing... (Gõ phím)
    socket.on('typing', async (payload) => {
        // Thêm senderName vào payload nhận được
        const { receiverId, conversationId, type, senderName } = payload; 
        const senderId = socket.user.id;
        
        let targetSocketIds = new Set();

        try {
            if (type === 'group' && conversationId) {
                const memberIds = await chatService.getGroupMemberIds(conversationId);
                memberIds.forEach(mId => {
                    if (mId !== senderId) {
                        const sockets = userSocketMap.get(mId);
                        if (sockets) sockets.forEach(s => targetSocketIds.add(s));
                    }
                });
            } else if (receiverId) {
                const receiverSockets = userSocketMap.get(receiverId);
                if (receiverSockets) receiverSockets.forEach(s => targetSocketIds.add(s));
            }

            targetSocketIds.forEach(socketId => {
                io.to(socketId).emit('partner_typing', { 
                    senderId, 
                    senderName, // Truyền tên xuống cho client
                    conversationId, 
                    type 
                });
            });
        } catch (e) {
            console.error('Typing error:', e);
        }
    });

    // Sự kiện: Stop Typing...
    socket.on('stop_typing', async (payload) => {
        // Thêm senderName (thực ra stop thì chỉ cần ID, nhưng cứ truyền cho đồng bộ)
        const { receiverId, conversationId, type, senderName } = payload;
        const senderId = socket.user.id;
        
        let targetSocketIds = new Set();

        try {
            if (type === 'group' && conversationId) {
                const memberIds = await chatService.getGroupMemberIds(conversationId);
                memberIds.forEach(mId => {
                    if (mId !== senderId) {
                        const sockets = userSocketMap.get(mId);
                        if (sockets) sockets.forEach(s => targetSocketIds.add(s));
                    }
                });
            } else if (receiverId) {
                const receiverSockets = userSocketMap.get(receiverId);
                if (receiverSockets) receiverSockets.forEach(s => targetSocketIds.add(s));
            }

            targetSocketIds.forEach(socketId => {
                io.to(socketId).emit('partner_stop_typing', { 
                    senderId,
                    senderName, 
                    conversationId, 
                    type 
                });
            });
        } catch (e) {
            console.error('Stop typing error:', e);
        }
    });


    // Sự kiện: Đánh dấu đã đọc
    socket.on('mark_as_read', async (payload) => {
        const { conversationId, partnerId } = payload;
        const readerId = socket.user.id;

        try {
            // 1. Cập nhật DB
            await chatService.markConversationAsRead(conversationId, readerId);

            // 2. Báo cho người gửi (partner) biết là tin nhắn đã được đọc
            // Để họ đổi icon từ ✓ sang ✓✓
            const partnerSockets = userSocketMap.get(partnerId);
            if (partnerSockets) {
                partnerSockets.forEach(socketId => {
                    io.to(socketId).emit('message_read_update', { 
                        conversationId, 
                        readerId 
                    });
                });
            }
        } catch (e) {
            console.error('Mark read error:', e);
        }
    });
};