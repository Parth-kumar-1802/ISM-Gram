import { ChatAlt2Icon, DownloadIcon, HeartIcon, SwitchHorizontalIcon } from '@heroicons/react/outline'
import Image from 'next/image'
import Link from 'next/link'
// import { useSession } from 'next-auth/react'
// import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
// import { useSelector } from 'react-redux'
import ReactTimeago from 'react-timeago'
import { useAppSelector } from '../store/hooks'
import { Comment, CommentBody, passingQuery, Tweet } from '../typings'
// const fetchComments = lazy(() => import('../utils/fetchComments'))
import { fetchComments } from '../utils/fetchComments'
import { fetchLikes } from '../utils/fetchLikes'
// import { fetchUser } from '../utils/fetchUser'


interface Props{
  tweet:Tweet
}

interface Props2 {
  src: string
  width: number
}

const myLoader = ({ src, width }:Props2,quality:number|undefined=50) => {
  // const { src, width, quality } = props
  // console.log(props);
  // console.log('result %s', `${src}?w=${width}&h=${height}&q=${quality || 75}`);
  return `${src}?width=${width}&q=${quality || 50}`
}

function Tweet({ tweet }: Props) {
  const [input, setInput] = useState<string>('')

  // const {data:session}=useSession();
  const user = useAppSelector((state) => state.user.user)

  // const user=userRedux['user'];

  const [comments, setComments] = useState<Comment[]>([])

  const [likes, setLikes] = useState<string[]>(tweet.likes)

  const [liked,setLiked]=useState<boolean>(false);

  const [commentBoxVisible, setCommentBoxVisible] = useState<boolean>(false)

  const refreshComments = async () => {
    await fetchComments(tweet._id).then((comments:Comment[]) => {
      setComments(comments)
    })
  }

  const refreshLikes = async () => {
    const likes: string[] = await fetchLikes(tweet._id)
    setLikes(likes)
  }

  useEffect(() => {
    refreshComments()
    refreshLikes()
  }, [])

  const postComment = async () => {
    const commentToast = toast.loading('Posting Comment...')

    // Comment logic
    const comment: CommentBody = {
      comment: input,
      tweetId: tweet._id,
      username: user.username || 'Unknown User',
      profileImg: user.profileImg || 'md.jpg',
    }

    await fetch(`/api/addComments`, {
      body: JSON.stringify(comment),
      method: 'POST',
    }).then(async (res) => {
      setInput('')
      setCommentBoxVisible(false)
      // setComments([...comments,comment]);
      await refreshComments()
      toast.success('Comment Posted!', {
        id: commentToast,
      })
      return res
    }).catch(err => {
      console.log(err);
    }) 
    // const json=result.json()

    // console.log('WOOHOO we made it', result)

  }

  const handleSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await postComment()
  }

  const likeTweet = async () => {
    const name_changed = user.email?.toString()
    // console.log(name_changed);

    if (liked || likes.includes(name_changed as string)) {
      toast.success('You have already liked the post', {
        icon: '😀',
      })
      return
    }

    setLiked(true);
    setLikes([...likes,name_changed as string])

    const tweetToast = toast.loading('Liking Post')

    const tweetInfo: passingQuery = {
      id: tweet._id,
      new_user: name_changed as string,
    }
    // console.log("HI");
    const result = await fetch(`/api/addLike`, {
      body: JSON.stringify(tweetInfo),
      method: 'POST',
    })
    const json = result.json()

    // const newTweets = await fetchTweets()
    // setTweets(newTweets)

    // await refreshLikes()

    toast('Post Liked', {
      icon: '❤️',
      id: tweetToast,
    })

    return json
  }

  const addLike = async (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault()

    await likeTweet()
  }

  const saveTweet =async (
    e: React.MouseEvent<SVGSVGElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault()
    // console.log("hey");

    // const user:User=await fetchUser(session?.user?.email);

    const tweetInfo: passingQuery = {
      id: user._id as string,
      new_user: tweet._id,
    }

    const res = await fetch('/api/saveTweet', {
      body: JSON.stringify(tweetInfo),
      method: 'POST',
    })

    return res.json()
  }

  return (
    <div className="flex flex-col space-x-3 border-y border-gray-100 p-5">
      <div className="flex space-x-3">
        <Image
          loader={myLoader}
          className="h-10 w-10 rounded-full object-cover"
          src={tweet.profileImg}
          alt="Author"
          height={40}
          width={40}
          layout="raw"
          sizes="30vw"
          priority
          placeholder="blur"
          blurDataURL="md.jpg"
        />
        <div>
          <div className="flex items-center space-x-1">
            <Link href={`/search/${tweet.username}`}>
              <p className="mr-1 cursor-pointer font-bold text-sm">{tweet.username}</p>
            </Link>
            <p className="hidden text-sm text-gray-500 sm:inline">
              @{tweet.username.replace(/\s+/g, '').toLowerCase()}
            </p>

            <ReactTimeago
              className="text-sm text-gray-500"
              date={tweet._createdAt}
            />
          </div>
          <p className="pt-1">{tweet.text}</p>
          {tweet.image && (
            <Image
              loader={myLoader}
              src={tweet.image}
              alt="Tweet Image"
              layout="raw"
              width={240}
              height={240}
              className="m-5 ml-0 mb-1 max-h-60 rounded-lg object-cover shadow-sm"
              sizes="50vw"
              placeholder="blur"
              blurDataURL="md.jpg"
              // priority
            />
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-between">
        <div
          onClick={() => user._id && setCommentBoxVisible(!commentBoxVisible)}
          className="flex cursor-pointer items-center space-x-3 text-gray-400"
        >
          <ChatAlt2Icon className="h-5 w-5" />
          <p>{comments.length}</p>
        </div>
        <Link href={`/posts/${tweet._id}`}>
          <div className="flex cursor-pointer items-center space-x-3 text-gray-400">
            <SwitchHorizontalIcon className="h-5 w-5" />
          </div>
        </Link>
        <form>
          <div
            onClick={(e) => user._id && addLike(e)}
            className="flex cursor-pointer items-center space-x-3 text-gray-400"
          >
            <HeartIcon className="h-5 w-5" />
            <input type="hidden" hidden />
            <p>{likes.length}</p>
          </div>
        </form>
        <div className="flex cursor-pointer items-center space-x-3 text-gray-400">
          {/* <UploadIcon className="h-5 w-5" /> */}
          <DownloadIcon
            onClick={(e) => user._id && saveTweet(e)}
            className="h-5 w-5"
          />
        </div>
      </div>

      {commentBoxVisible && (
        <form onSubmit={handleSubmit} className="mt-3 flex space-x-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg bg-gray-100 p-2 outline-none"
            type="text"
            placeholder="Write a Comment..."
          />
          <button
            disabled={!input}
            type="submit"
            className="text-twitter disabled:text-gray-200"
          >
            Post
          </button>
        </form>
      )}

      {comments?.length > 0 && (
        <div className="my-2 mt-5 max-h-44 space-y-5 overflow-y-scroll border-t border-gray-100 p-5 scrollbar-hide">
          {comments.map((comment) => {
            return (
              <div key={comment._id} className="relative flex space-x-2">
                <hr className="absolute left-5 top-10 h-8 border-x border-twitter/30" />
                <Image
                  loader={myLoader}
                  src={comment.profileImg || 'md.jpg'}
                  className="mt-2 h-7 w-7 rounded-full object-cover"
                  alt="Author image"
                  height={28}
                  width={28}
                  layout="raw"
                  sizes="50vw"
                  priority
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="mr-1 text-sm font-bold">{comment.username}</p>
                    <p className="hidden text-xs text-gray-500 lg:inline">
                      @{comment.username.replace(/\s+/g, '').toLowerCase()}
                    </p>
                    <ReactTimeago
                      className="text-sm text-gray-500"
                      date={comment._createdAt}
                    />
                  </div>
                  <p>{comment.comment}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Tweet