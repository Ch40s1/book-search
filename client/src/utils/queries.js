import { gql } from '@apollo/client';

export const GET_ME = gql`
query Query {
  me {
    email
    _id
    username
    savedBooks {
      authors
      bookId
      description
      image
      link
      title
    }
  }
}
`
