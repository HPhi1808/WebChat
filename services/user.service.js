// services/user.service.js
const userRepository = require('../repositories/user.repository');

class UserService {
    async searchUser(keyword, currentUserId) {
        let users = await userRepository.searchUsers(keyword);

        users = users.filter(u => u.id !== currentUserId);

        return users;
    }

    async getUserById(id) {
        const user = await userRepository.findUserById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

module.exports = new UserService();