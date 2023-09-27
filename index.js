const { ApolloServer, gql } = require("apollo-server")
const uuid = require("uuid");
const axios = require("axios");
const { createClient } = require("redis");
const ACCESS_KEY = "Veujp3vNPSRDHOgPso-h_w7mKpX8d5LBFvfN1fNGtkw";
const _ = require("lodash");

const typeDefs = gql`
  type Query {
    unsplashImages(pageNum: Int): [ImagePost]
    binnedImages: [ImagePost]
    userPostedImages: [ImagePost]
    getTopTenImages: [ImagePost]
  }

  type ImagePost {
    id: ID!
    url: String!
    posterName: String!
    description: String!
    userPosted: Boolean!
    binned: Boolean!
    numBinned: Int
    blurHash: String
  }

  type Mutation {
    uploadImage(url: String!, description: String, posterName: String): ImagePost
    updateImage(
      id: ID!
      url: String
      posterName: String
      description: String
      userPosted: Boolean
      binned: Boolean
      numBinned: Int
    ): ImagePost
    deleteImage(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    unsplashImages: async (_, args) => {
      const redisClient = createClient();
      redisClient.on("error", (err) => console.log("Redis Client Error", err));
      await redisClient.connect();
      let { pageNum } = args;
      let url = `https://api.unsplash.com/photos/?client_id=${ACCESS_KEY}&page=${pageNum}`;
      let { data, headers } = await axios.get(url);
      // Logging ratelimit - to make sure we don't overshoot the allowed 50 rph
      // console.log("Remaining Ratelimit: ", headers["x-ratelimit-remaining"]);
      let imagePosts = [];
      for (const image of data) {
        let postObj = {
          id: image.id,
          url: image.urls.regular,
          posterName: image.user.name ? image.user.name : "N/A",
          description: image.description ? image.description : "N/A",
          userPosted: false,
          binned: (await redisClient.get(image.id)) ? true : false,
          numBinned: image.likes,
        };
        imagePosts.push(postObj);
      }
      return imagePosts;
    },
    binnedImages: async (_, args) => {
      const redisClient = createClient();
      redisClient.on("error", (err) => console.log("Redis Client Error", err));
      await redisClient.connect();
      let userBinned = await redisClient.zRangeByScore("bin", 0, Infinity);
      let binnedImages = [];
      for (const postId of userBinned) {
        let content = await redisClient.get(postId);
        if (content) binnedImages.push(JSON.parse(content));
      }
      return binnedImages;
    },
    userPostedImages: async (_, args) => {
      try {
        const redisClient = createClient();
        redisClient.on("error", (err) => console.log("Redis Client Error", err));
        await redisClient.connect();
        let userImageIds = await redisClient.lRange("userPosts", 0, -1);
        let result = [];
        for (const id of userImageIds) {
          let content = await redisClient.get(id);
          if (content) {
            let object = JSON.parse(content);
            result.push(object);
          }
        }
        // console.log("User Posted: ", result);
        return result;
      } catch (e) {
        console.log(e);
      }
    },
    getTopTenImages: async (_, args) => {
      const redisClient = createClient();
      redisClient.on("error", (err) => console.log("Redis Client Error", err));
      await redisClient.connect();
      let userBinned = await redisClient.zRangeByScore("bin", 0, Infinity);
      let binnedImages = [];
      for (const postId of userBinned) {
        let content = await redisClient.get(postId);
        if (content) binnedImages.push(JSON.parse(content));
      }

      // console.log("Images Binned (Top Ten): ", binnedImages);
      return binnedImages.reverse().slice(0, 10);
    },
  },
  Mutation: {
    uploadImage: async (_, args) => {
      let { url, description, posterName } = args;
      let image = {
        id: uuid.v4(),
        url,
        description,
        posterName,
        binned: false,
        userPosted: true,
        numBinned: 0,
      };
      const redisClient = createClient();
      redisClient.on("error", (err) => console.log("Redis Client Error", err));
      await redisClient.connect();
      await redisClient.rPush("userPosts", image.id);
      await redisClient.set(image.id, JSON.stringify(image));
      await redisClient.disconnect();
      return image;
    },
    updateImage: async (_, args) => {
      let { id, url, posterName, description, userPosted, binned, numBinned } = args;
      const redisClient = createClient();
      redisClient.on("error", (err) => console.log("Redis Client Error", err));
      await redisClient.connect();
      if (binned) {
        try {
          console.log("Binning Image with id " + id + " with score " + numBinned);
          // binned is set to true -> add it to redis cache
          let image = {
            id,
            url,
            posterName,
            description,
            userPosted,
            binned,
            numBinned,
          };
          await redisClient.zAdd("bin", { score: numBinned, value: image.id });
          await redisClient.del(image.id);
          // deleting previous copy and adding new -> to update binned state
          await redisClient.set(image.id, JSON.stringify(image));
          await redisClient.disconnect();
          return image;
        } catch (e) {
          console.log(e);
        }
      } else {
        if (userPosted) {
          console.log("Unbinning image with id " + id);
          await redisClient.zRem("bin", id);
          let existingImage = await redisClient.get(id);
          let parsedImage = JSON.parse(existingImage);
          parsedImage.binned = false;
          await redisClient.del(id);
          await redisClient.set(id, JSON.stringify(parsedImage));
          await redisClient.disconnect();
        } else {
          console.log("Unbinning image with id " + id);
          await redisClient.zRem("bin", id);
          await redisClient.del(id);
          await redisClient.disconnect();
        }
        // let image;
        // if (existingImage) {
        //   image = JSON.parse(existingImage);
        //   image.binned = false;
        // }
        // await redisClient.set(id, JSON.stringify(existingImage));
        // return image;
      }
    },
    deleteImage: async (_, args) => {
      try {
        let { id } = args;
        console.log("Deleting image with id " + id);
        // todo
        const redisClient = createClient();
        redisClient.on("error", (err) => console.log("Redis Client Error", err));
        await redisClient.connect();
        let image = await redisClient.get(id);
        await redisClient.lRem("userPostedImages", 0, id);
        if (image.binned) await redisClient.zRem("bin", id);
        await redisClient.del(id);
        await redisClient.disconnect();
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log("🚀 Server started at " + url + "! 🚀");
});
