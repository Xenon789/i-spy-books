const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async function (parent, args, context) {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not Logged In!');
        }
    },
    Mutation: {
        addUser: async function (parent, args) {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user};
        },
        login: async function (parent, { email, password }) {
            const user = await User.findOne({ email });
            if (!user) {
                throw AuthenticationError('No user associated with this email!');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw AuthenticationError('Incorrect Password! Please Try Again.');
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async function (parent, { bookId }, context) {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId }}},
                    { new: true }
                )
            }
            return updatedUser;
        }
    }
}

module.exports = resolvers;