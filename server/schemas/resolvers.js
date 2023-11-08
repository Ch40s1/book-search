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
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      console.log("resolver hit!");
      const user = await User.findOne({ email });

      if (!user ) {
        throw new AuthenticationError('Invalid email or password');
      }

      const validatePW =await user.isCorrectPassword(password);

      if(!validatePW){
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
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        try {
          // Create a new book based on the input
          const newBook = await Book.create(input);

          // Add the new book to the user's savedBooks array
          const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: newBook } },
            { new: true }
          ).populate('savedBooks'); // Populate the savedBooks field

          return updatedUser;
        } catch (err) {
          throw new Error('Could not save the book');
        }
      } else {
        throw new AuthenticationError('You must be logged in to save a book');
      }
    },
  }
};

module.exports=resolvers;
