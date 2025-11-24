'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import EditProfileModal from '@/components/EditProfileModal';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import UserAvatar from '@/components/UserAvatar';
import { ArrowLeft, Calendar, LinkIcon, MapPin, MoreHorizontal, Loader2 } from 'lucide-react';
import { getFromIPFS } from '@/lib/ipfs';
import { formatDistanceToNow } from 'date-fns';
import TextWithHashtags from '@/components/TextWithHashtags';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
  });

  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  const username = profile?.username || `user_${address?.slice(-4)}`;
  const bio = profile?.bio || 'Web3 enthusiast 🚀 | NFT collector | DeFi explorer';
  const followerCount = profile?.followerCount ? Number(profile.followerCount) : 0;
  const followingCount = profile?.followingCount ? Number(profile.followingCount) : 0;

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'media', label: 'Media' },
    { id: 'likes', label: 'Likes' },
  ];

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      {/* Left Sidebar */}
      <div className="w-[68px] xl:w-[275px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
        <div className="fixed w-[68px] xl:w-[275px] h-screen">
          <FeedNavigation />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[600px] border-r border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-8 px-4 py-2">
            <button 
              onClick={() => router.push('/feed')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{username}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <UserPostCount userAddress={address as string} />
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div>
          {/* Cover Image */}
          <div className="h-[200px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          {/* Profile Info */}
          <div className="px-4 pb-4">
            {/* Avatar & Edit Button */}
            <div className="flex justify-between items-start -mt-16 mb-4">
              <div className="border-4 border-white dark:border-black rounded-full">
                <UserAvatar 
                  address={address as `0x${string}`}
                  showVerified={true}
                  className="w-[130px] h-[130px]"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
                  <MoreHorizontal size={20} className="text-gray-900 dark:text-white" />
                </button>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  Edit profile
                </button>
              </div>
            </div>

            {/* Name & Username */}
            <div className="mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{username}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            {/* Bio */}
            <p className="text-gray-900 dark:text-white mb-3">{bio}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Metaverse</span>
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <a href="#" className="text-blue-500 hover:underline">web3social.io</a>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Joined November 2024</span>
              </div>
            </div>

            {/* Following/Followers */}
            <div className="flex gap-5 text-sm">
              <button className="hover:underline">
                <span className="font-bold text-gray-900 dark:text-white">{followingCount}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
              </button>
              <button className="hover:underline">
                <span className="font-bold text-gray-900 dark:text-white">{followerCount}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900/50 transition relative ${
                    activeTab === tab.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'posts' && (
              <UserPostsList userAddress={address as string} />
            )}

            {activeTab === 'replies' && (
              <UserRepliesList userAddress={address as string} />
            )}

            {activeTab === 'media' && (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Lights, camera ... attachments!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    When you post photos or videos, they'll show up here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'likes' && (
              <UserLikesList userAddress={address as string} />
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block w-[350px] flex-shrink-0">
        <div className="fixed w-[350px] h-screen p-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Subscribe to Premium</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to unlock new features and if eligible, receive a share of ads revenue.
            </p>
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentProfile={{
          username,
          bio,
          avatarHash: '',
        }}
      />
    </div>
  );
}

// Component to count user's posts
function UserPostCount({ userAddress }: { userAddress: string }) {
  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    const countUserPosts = async () => {
      if (!postCount) return;
      
      const totalPosts = Number(postCount);
      let userPostCount = 0;

      for (let i = 1; i <= totalPosts; i++) {
        userPostCount++;
      }
      
      setCount(userPostCount);
    };

    countUserPosts();
  }, [postCount, userAddress]);

  return <>{count} posts</>;
}

// Component to display user's posts
function UserPostsList({ userAddress }: { userAddress: string }) {
  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const [userPosts, setUserPosts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!postCount) {
        setIsLoading(false);
        return;
      }

      const totalPosts = Number(postCount);
      const posts: number[] = [];

      for (let i = totalPosts; i >= 1; i--) {
        posts.push(i);
      }

      setUserPosts(posts);
      setIsLoading(false);
    };

    fetchUserPosts();
  }, [postCount, userAddress]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (userPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            You haven't posted yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            When you post, it'll show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {userPosts.map((postId) => (
        <UserPostItem key={postId} postId={postId} userAddress={userAddress} />
      ))}
    </div>
  );
}

// Component to render individual post if it belongs to user
function UserPostItem({ postId, userAddress }: { postId: number; userAddress: string }) {
  const { data: post, isLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  if (isLoading) return null;
  
  if (!post || post.isDeleted) return null;
  
  if (post.author.toLowerCase() !== userAddress.toLowerCase()) return null;

  return (
    <PostCard
      postId={Number(post.id)}
      author={post.author}
      contentHash={post.contentHash}
      timestamp={Number(post.timestamp)}
      likes={Number(post.likes)}
    />
  );
}

// Component to display user's replies (comments)
function UserRepliesList({ userAddress }: { userAddress: string }) {
  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserReplies = async () => {
      if (!postCount) {
        setIsLoading(false);
        return;
      }

      const totalPosts = Number(postCount);
      const replies: any[] = [];

      for (let i = totalPosts; i >= 1; i--) {
        replies.push({ postId: i });
      }

      setUserReplies(replies);
      setIsLoading(false);
    };

    fetchUserReplies();
  }, [postCount, userAddress]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (userReplies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            You haven't replied yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            When you reply to posts, they'll show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {userReplies.map((reply) => (
        <UserReplyItem key={reply.postId} postId={reply.postId} userAddress={userAddress} />
      ))}
    </div>
  );
}

// Component to render user's comments
function UserReplyItem({ postId, userAddress }: { postId: number; userAddress: string }) {
  const { data: comments } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getComments',
    args: [BigInt(postId)],
  });

  if (!comments || comments.length === 0) return null;

  const userComments = comments.filter(
    (comment: any) => comment.author.toLowerCase() === userAddress.toLowerCase()
  );

  if (userComments.length === 0) return null;

  return (
    <>
      {userComments.map((comment: any) => (
        <CommentCard key={comment.id} comment={comment} postId={postId} />
      ))}
    </>
  );
}

// Component to display a single comment
function CommentCard({ comment, postId }: { comment: any; postId: number }) {
  const [content, setContent] = useState('Loading...');
  const router = useRouter();

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [comment.author as `0x${string}`],
  });

  useEffect(() => {
    getFromIPFS(comment.contentHash).then(setContent).catch(() => setContent('Failed to load'));
  }, [comment.contentHash]);

  const username = profile?.username || `user_${comment.author?.slice(-4)}`;

  return (
    <article 
      onClick={() => router.push(`/post/${postId}`)}
      className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition cursor-pointer"
    >
      <div className="flex gap-3">
        <div 
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/profile/${comment.author}`);
          }}
        >
          <UserAvatar 
            address={comment.author as `0x${string}`}
            size="lg"
            showVerified={true}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${comment.author}`);
              }}
              className="font-bold text-gray-900 dark:text-white hover:underline"
            >
              {username}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
            </span>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {formatDistanceToNow(new Date(Number(comment.timestamp) * 1000), { addSuffix: true })}
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Replying to post #{postId}
          </div>
          <div className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap break-words">
            <TextWithHashtags text={content} />
          </div>
        </div>
      </div>
    </article>
  );
}

// Component to display user's liked posts
function UserLikesList({ userAddress }: { userAddress: string }) {
  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!postCount) {
        setIsLoading(false);
        return;
      }

      const totalPosts = Number(postCount);
      const posts: number[] = [];

      for (let i = totalPosts; i >= 1; i--) {
        posts.push(i);
      }

      setLikedPosts(posts);
      setIsLoading(false);
    };

    fetchLikedPosts();
  }, [postCount, userAddress]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (likedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            You don't have any likes yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Tap the heart on any post to show it some love. When you do, it'll show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {likedPosts.map((postId) => (
        <UserLikedPostItem key={postId} postId={postId} userAddress={userAddress} />
      ))}
    </div>
  );
}

// Component to render liked post
function UserLikedPostItem({ postId, userAddress }: { postId: number; userAddress: string }) {
  const { data: hasLiked } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'hasLiked',
    args: [BigInt(postId), userAddress as `0x${string}`],
  });

  const { data: post, isLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  if (isLoading) return null;
  
  if (!post || post.isDeleted) return null;
  
  if (!hasLiked) return null;

  return (
    <PostCard
      postId={Number(post.id)}
      author={post.author}
      contentHash={post.contentHash}
      timestamp={Number(post.timestamp)}
      likes={Number(post.likes)}
    />
  );
}