// server/seeds/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed database...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Cleared existing data');

    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2MzY2ZjEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiPlNIPC90ZXh0Pjwvc3ZnPg==';

    // Create users
    const users = await User.create([
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Software developer and tech enthusiast 💻',
        profileImage: placeholder
      },
      {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Designer | Creative thinker | Coffee lover ☕',
        profileImage: placeholder
      },
      {
        username: 'bobsmith',
        email: 'bob@example.com',
        password: 'password123',
        bio: 'Photographer 📸 | Travel addict 🌍',
        profileImage: placeholder
      },
      {
        username: 'alicejones',
        email: 'alice@example.com',
        password: 'password123',
        bio: 'Marketing professional | Social media expert',
        profileImage: placeholder
      },
      {
        username: 'mikewilson',
        email: 'mike@example.com',
        password: 'password123',
        bio: 'Fitness coach 💪 | Nutrition enthusiast 🥗',
        profileImage: placeholder
      }
    ]);

    console.log('✅ Created users:', users.length);

    // Create posts
    const posts = await Post.create([
      {
        author: users[0]._id,
        content: 'Just launched my new website! Check it out and let me know what you think 🚀',
        likeCount: 15,
        commentCount: 3
      },
      {
        author: users[0]._id,
        content: 'Learning React hooks today. The useState and useEffect hooks are game changers! #webdev #react',
        likeCount: 8,
        commentCount: 2
      },
      {
        author: users[1]._id,
        content: 'New design project completed! Really proud of how this turned out 🎨',
        image: placeholder,
        likeCount: 23,
        commentCount: 5
      },
      {
        author: users[1]._id,
        content: 'Coffee break ☕ What\'s everyone working on today?',
        likeCount: 12,
        commentCount: 8
      },
      {
        author: users[2]._id,
        content: 'Sunset photography from yesterday\'s shoot. Nature is amazing! 🌅',
        image: placeholder,
        likeCount: 45,
        commentCount: 7
      },
      {
        author: users[2]._id,
        content: 'Just booked my next trip to Japan! Can\'t wait to explore Tokyo 🇯🇵',
        likeCount: 20,
        commentCount: 4
      },
      {
        author: users[3]._id,
        content: '5 tips for better social media engagement:\n1. Post consistently\n2. Use quality images\n3. Engage with your audience\n4. Use hashtags wisely\n5. Analyze your metrics',
        likeCount: 34,
        commentCount: 6
      },
      {
        author: users[3]._id,
        content: 'Monday motivation! What are your goals for this week? 💪',
        likeCount: 18,
        commentCount: 12
      },
      {
        author: users[4]._id,
        content: 'Leg day complete! 🏋️ Remember, consistency is key to achieving your fitness goals.',
        likeCount: 27,
        commentCount: 5
      },
      {
        author: users[4]._id,
        content: 'Meal prep Sunday! Planning is half the battle when it comes to nutrition 🥗',
        image: placeholder,
        likeCount: 31,
        commentCount: 9
      }
    ]);

    console.log('✅ Created posts:', posts.length);

    // Update user post counts
    for (const user of users) {
      const postCount = posts.filter(p => p.author.toString() === user._id.toString()).length;
      await User.findByIdAndUpdate(user._id, { postCount });
    }

    // Create follows
    const follows = [];

    // User 0 follows users 1, 2, 3
    follows.push(
      { follower: users[0]._id, following: users[1]._id },
      { follower: users[0]._id, following: users[2]._id },
      { follower: users[0]._id, following: users[3]._id }
    );

    // User 1 follows users 0, 2, 4
    follows.push(
      { follower: users[1]._id, following: users[0]._id },
      { follower: users[1]._id, following: users[2]._id },
      { follower: users[1]._id, following: users[4]._id }
    );

    // User 2 follows all others
    follows.push(
      { follower: users[2]._id, following: users[0]._id },
      { follower: users[2]._id, following: users[1]._id },
      { follower: users[2]._id, following: users[3]._id },
      { follower: users[2]._id, following: users[4]._id }
    );

    // User 3 follows users 1, 4
    follows.push(
      { follower: users[3]._id, following: users[1]._id },
      { follower: users[3]._id, following: users[4]._id }
    );

    // User 4 follows users 0, 2
    follows.push(
      { follower: users[4]._id, following: users[0]._id },
      { follower: users[4]._id, following: users[2]._id }
    );

    await Follow.insertMany(follows);
    console.log('✅ Created follows:', follows.length);

    // Update follower and following counts
    for (const user of users) {
      const followerCount = follows.filter(f => f.following.toString() === user._id.toString()).length;
      const followingCount = follows.filter(f => f.follower.toString() === user._id.toString()).length;
      await User.findByIdAndUpdate(user._id, { followerCount, followingCount });
    }

    // Create likes (random likes from users)
    const likes = [];
    const likedPosts = new Set();

    // Randomly like posts
    for (const post of posts) {
      const numLikes = Math.floor(Math.random() * users.length) + 1;
      const likingUsers = users.sort(() => 0.5 - Math.random()).slice(0, numLikes);

      for (const user of likingUsers) {
        const likeKey = `${user._id}-${post._id}`;
        if (!likedPosts.has(likeKey)) {
          likes.push({ user: user._id, post: post._id });
          likedPosts.add(likeKey);
        }
      }
    }

    await Like.insertMany(likes);
    console.log('✅ Created likes:', likes.length);

    // Create comments
    const comments = await Comment.create([
      {
        post: posts[0]._id,
        author: users[1]._id,
        content: 'Looks amazing! Great work! 👏'
      },
      {
        post: posts[0]._id,
        author: users[2]._id,
        content: 'Love the design! Very clean and modern.'
      },
      {
        post: posts[1]._id,
        author: users[3]._id,
        content: 'Hooks are definitely a game changer. Have you tried useReducer yet?'
      },
      {
        post: posts[2]._id,
        author: users[0]._id,
        content: 'Beautiful work! The color palette is perfect 🎨'
      },
      {
        post: posts[2]._id,
        author: users[4]._id,
        content: 'This is incredible! You have real talent.'
      },
      {
        post: posts[3]._id,
        author: users[0]._id,
        content: 'Working on a new project! Coffee sounds great right about now ☕'
      },
      {
        post: posts[4]._id,
        author: users[1]._id,
        content: 'Stunning photo! What camera do you use?'
      },
      {
        post: posts[5]._id,
        author: users[3]._id,
        content: 'Japan is amazing! Make sure to visit Kyoto too 🏯'
      },
      {
        post: posts[6]._id,
        author: users[0]._id,
        content: 'Great tips! Consistency is definitely key.'
      },
      {
        post: posts[7]._id,
        author: users[1]._id,
        content: 'My goal is to launch my new portfolio website this week!'
      },
      {
        post: posts[8]._id,
        author: users[2]._id,
        content: 'Keep it up! 💪'
      },
      {
        post: posts[9]._id,
        author: users[0]._id,
        content: 'Meal prep is the best! What are your go-to recipes?'
      }
    ]);

    console.log('✅ Created comments:', comments.length);

    // Create some notifications
    const notifications = [
      {
        recipient: users[0]._id, // John
        sender: users[1]._id,    // Jane
        type: 'like',
        post: posts[0]._id,
        message: 'liked your post',
        isRead: false
      },
      {
        recipient: users[0]._id,
        sender: users[2]._id,    // Bob
        type: 'comment',
        post: posts[1]._id,
        message: 'commented on your post',
        isRead: false
      },
      {
        recipient: users[0]._id,
        sender: users[3]._id,    // Alice
        type: 'follow',
        message: 'started following you',
        isRead: false
      }
    ];

    await Notification.insertMany(notifications);
    console.log('✅ Created initial notifications');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Follows: ${follows.length}`);
    console.log(`   Likes: ${likes.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log('\n👤 Test Accounts:');
    users.forEach(user => {
      console.log(`   Email: ${user.email} | Password: password123`);
    });
    console.log('\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run seeder
connectDB().then(seedData);