const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('books');
      }
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Invalid email or password');
      }

      const token = signToken(user);

      return { token, user };
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const book = await Book.findById(bookId);

        if (!book) {
          throw new Error('Book not found');
        }

        await Book.findByIdAndDelete(bookId);
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: bookId } }
        );
        return book;
      }
    }
  }
};
