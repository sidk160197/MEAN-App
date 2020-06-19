const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  let postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage) {
    postQuery.skip(pageSize*(currentPage - 1)).limit(pageSize);
  }
  postQuery.find()
    .then((posts) => {
      fetchedPosts = posts;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts retrived successfully",
        posts: fetchedPosts,
        postsCount: count
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Error in retriving posts.",
      });
    });
};

exports.addPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/" + req.file.path.replace("\\", "/"),
    creator: req.userData.userId
  });
  post
    .save()
    .then((post) => {
      res.status(201).json({
        message: "Post saved!",
        post: post,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Post cannot be saved",
      });
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.id;
  Post.deleteOne({ _id: postId, creator: req.userData.userId })
    .then((result) => {
      if(result.n > 0) {
        res.status(200).json({
          message: "Deletion successful"
        });
      } else {
        res.status(401).json({
          message: "Failed to delete!!"
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Post cannot be saved",
      });
    });
};

exports.editPost = (req, res, next) => {
  const postId = req.params.id;
  let imagePath = req.body.imagePath;

  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/" + req.file.path.replace("\\", "/");
  }

  const post = new Post({
    _id: postId,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: postId, creator: req.userData.userId }, post)
    .then((result) => {
      if(result.n > 0) {
        res.status(200).json({
          message: "Updated successfully"
        });
      } else {
        res.status(401).json({
          message: "Failed to update!!"
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Error in updating post!",
      });
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.id;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(500).json({
          message: "No post found!",
        });
      }
      res.status(200).json({
        message: "Success",
        post: {
          id: post._id,
          title: post.title,
          content: post.content,
          imagePath: post.imagePath,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Error in fetching post.",
      });
    });
};
