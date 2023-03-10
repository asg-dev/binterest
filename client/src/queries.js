import { gql } from "@apollo/client";

const GET_UNSPLASH_IMAGES = gql`
  query ($pageNum: Int!) {
    unsplashImages(pageNum: $pageNum) {
      id
      url
      posterName
      description
      userPosted
      binned
      numBinned
    }
  }
`;

const GET_USER_BINNED_IMAGES = gql`
  query {
    binnedImages {
      id
      url
      posterName
      description
      userPosted
      binned
      numBinned
    }
  }
`;

const GET_USER_POSTED_IMAGES = gql`
  query {
    userPostedImages {
      id
      url
      posterName
      userPosted
      description
      binned
      numBinned
    }
  }
`;

const BIN_IMAGE = gql`
  mutation binImage(
    $id: ID!
    $url: String
    $posterName: String
    $description: String
    $userPosted: Boolean
    $binned: Boolean
    $numBinned: Int
  ) {
    updateImage(
      id: $id
      url: $url
      posterName: $posterName
      description: $description
      userPosted: $userPosted
      binned: $binned
      numBinned: $numBinned
    ) {
      id
      url
      posterName
      description
      userPosted
      binned
      numBinned
    }
  }
`;

const UPLOAD_IMAGE = gql`
  mutation uploadImage($url: String!, $posterName: String!, $description: String!) {
    uploadImage(url: $url, posterName: $posterName, description: $description) {
      id
      url
      posterName
      userPosted
      binned
    }
  }
`;

const DELETE_IMAGE = gql`
  mutation deleteImage($id: ID!) {
    deleteImage(id: $id)
  }
`;

const GET_POPULAR_IMAGES = gql`
  query getTopTenImages {
    getTopTenImages {
      id
      url
      posterName
      description
      userPosted
      binned
      numBinned
    }
  }
`;

let exported = {
  GET_UNSPLASH_IMAGES,
  GET_USER_POSTED_IMAGES,
  GET_USER_BINNED_IMAGES,
  BIN_IMAGE,
  UPLOAD_IMAGE,
  DELETE_IMAGE,
  GET_POPULAR_IMAGES,
};

export default exported;
