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
      console.log("LOGIN: resolver hit!");
      const user = await User.findOne({ email });

      if (!user ) {
        throw new AuthenticationError('Invalid email or password');
      }
      console.log("LOGIN: user exists");
      const validatePW =await user.isCorrectPassword(password);

      if(!validatePW){
        throw new AuthenticationError('Invalid email or password');
      }

      console.log("LOGIN: password good");
      const token = signToken(user);
      console.log("LOGIN: signed token");

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
    saveBook: async (parent, { book }, context) => {
      try {
        console.log(book);

        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: book } },
            { new: true, runValidators: true }
          );

          console.log(updatedUser);
          return updatedUser;
        }

        throw new AuthenticationError('You need to be logged in!');
      } catch (error) {
        // Handle the error as needed
        console.error('Error saving book:', error);
        throw new Error('Could not save the book.');
      }
    },

  }
};

module.exports=resolvers;
