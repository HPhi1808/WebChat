// controllers/user.controller.js
const userService = require('../services/user.service');

class UserController {
    async search(req, res) {
        try {
            const { email } = req.query;
            const currentUserId = req.user.id;

            if (!email) return res.status(400).json({ error: 'Vui lòng nhập từ khóa' });

            const users = await userService.searchUser(email, currentUserId);
            
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            
            const user = await userService.getUserById(userId);
            
            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }
}

module.exports = new UserController();