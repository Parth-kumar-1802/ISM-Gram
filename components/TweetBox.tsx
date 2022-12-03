import {
  PhotographIcon,
  SearchCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from '@heroicons/react/outline'
import Image, { ImageLoader } from 'next/image';
// import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
// import { useSelector } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import { Tweet, TweetBody } from '../typings';
import { fetchTweets } from '../utils/fetchTweets';

interface Props {
  setTweets: React.Dispatch<React.SetStateAction<Tweet[]>>
}

interface Props2 {
  src:string,
  width :number,
  // quality:number|undefined
}

const myLoader = ({ src, width }:Props2,quality:number|undefined=75) => {
  // const { src, width, quality } = props
  // console.log(props);
  // console.log('result %s', `${src}?w=${width}&h=${height}&q=${quality || 75}`);
  return `${src}?w=${width}&q=${quality || 50}`
}

function TweetBox({setTweets}:Props) {

  const [input,setInput] =useState<string>('');
  const [image,setImage]=useState<string>('');
  const [visible,setVisible]=useState<boolean>(false);

  const imageInputRef=useRef<HTMLInputElement>(null);
  const filePickerRef=useRef<HTMLInputElement>(null);

  const [imageToPost, setImageToPost] = useState<
    string | undefined | ArrayBuffer | null
  >();

  // const {data:session}=useSession();
  const [imageUrlBoxIsOpen,setImageUrlBoxIsOpen]=useState<boolean>(false);

  const user = useAppSelector((state) => state.user.user)


  const addImageToTweet = (e:React.MouseEvent<HTMLButtonElement,globalThis.MouseEvent>) => {
    e.preventDefault();
    if(!imageInputRef.current?.value) return;
    setImage(imageInputRef.current.value);
    imageInputRef.current.value='';
    setImageUrlBoxIsOpen(false);
  }

  const postTweet = async () => {

    const tweetToast = toast.loading('Posting Post');

    const tweetInfo: TweetBody = {
      text: input,
      username: user.username || 'Unknown User',
      profileImg:
        user?.profileImg ||
        'md.jpg',
      image:image || imageToPost as string,
      likes:[],
      privacy:!visible,
    }
    const result = await fetch(`/api/addTweet`,{
      body:JSON.stringify(tweetInfo),
      method:'POST',
    })
    const json =result.json();


    const newTweets = await fetchTweets();
    setTweets(newTweets);

    toast('Post Posted', {
      icon: '🔥',
      id:tweetToast,
    })

    return json;

  }

  // useEffect(() =>{
  //   setVisibility();
  // },[]);

  const handleSubmit = (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    postTweet();

    setInput('');
    setImage(''); 
    setImageUrlBoxIsOpen(false);
    setImageToPost(null);
  }

  const addImageToPost = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files)return ;

    // console.log(e.target.files[0]);
    const reader = new FileReader();
    if(e.target.files[0]){
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onloadend=() => {
      // if(!readerEvent.target.result)return ;
      setImageToPost(reader.result);
    }
  }

  const removeImage = () => {
    setImage('');
    setImageToPost('');
  }

  const setVisibility = () => {
    if(!input || !user._id){
      setVisible(false);
      return ;
    }
    if(visible){
      toast.success('Post only available to ISMites!!', {
        icon: '🔒',
      })
    }else{
      toast.success('Post Made Public', {
        icon: '👀',
      })
    }
    setVisible(!visible);
  }

  return (
    <div className="flex space-x-2 px-5 py-2">
      <Image
        loader={myLoader}
        className="mt-4 h-14 w-14 rounded-full object-cover"
        src={user?.profileImg || 'md.jpg'}
        height={56}
        width={56}
        alt="md.jpg"
        layout="raw"
        sizes="50vw"
        priority
      />
      <div className="flex flex-1 items-center pl-2">
        <form className="flex flex-1 flex-col">
          <input
            disabled={!user._id}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-20 w-full text-lg outline-base placeholder:text-base disabled:bg-inherit"
            type="text"
            placeholder={
              user._id
                ? `Hey ${user.username} What's happening?🤩`
                : 'Login to tweet🙃'
            }
          />
          <div className="flex items-center">
            <div className="flex flex-1 space-x-2 text-twitter">
              {/* Icons */}
              <PhotographIcon
                onClick={() =>
                  user._id && setImageUrlBoxIsOpen(!imageUrlBoxIsOpen)
                }
                className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150"
              />
              {/* <div onClick={() => filePickerRef.current?.click()}>
                <SearchCircleIcon
                  className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150"
                />
                <input ref={filePickerRef} hidden onChange={addImageToPost} type="file" />
              </div> */}
              <div onClick={() => user._id && filePickerRef.current?.click()}>
                <SearchCircleIcon
                  onClick={() => user._id && setImageUrlBoxIsOpen(false)}
                  className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150"
                />
                <input
                  ref={filePickerRef}
                  hidden
                  onChange={addImageToPost}
                  type="file"
                />
              </div>
              {/* <EmojiHappyIcon className="h-5 w-5" /> */}
              {/* <CalendarIcon className="h-5 w-5" /> */}
              {visible && input ? (
                <EyeIcon
                  className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150"
                  onClick={setVisibility}
                />
              ) : (
                <EyeOffIcon
                  className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150"
                  onClick={setVisibility}
                />
              )}
              {/* <LocationMarkerIcon className="h-5 w-5" /> */}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input || !user._id}
              className="rounded-full bg-twitter px-5 py-2 font-bold text-white disabled:opacity-40"
            >
              Post
            </button>
          </div>

          {imageUrlBoxIsOpen && (
            <form className="mt-5 flex rounded-lg bg-twitter/80 py-2 px-4">
              <input
                ref={imageInputRef}
                className="flex-1 bg-transparent p-2 text-white outline-none placeholder:text-white"
                type="text"
                placeholder="Enter Image Url..."
              />
              <button
                type="submit"
                onClick={addImageToTweet}
                className="font-bold text-white"
              >
                Add Image
              </button>
            </form>
          )}

          {image && (
            <div className="flex transform cursor-pointer flex-col filter transition duration-150 hover:scale-105 hover:brightness-110">
              <Image
                loader={myLoader}
                src={image}
                width={160}
                sizes='50vw'
                height={160}
                className="mt-10 h-40 w-full rounded-xl object-contain shadow-lg"
                alt="Not available"
                priority
                layout='raw'
              />
              <p
                className="text-center text-xs text-red-500"
                onClick={removeImage}
              >
                Remove
              </p>
            </div>
          )}
          {imageToPost && (
            <div className="flex transform cursor-pointer flex-col filter transition duration-150 hover:scale-105 hover:brightness-110">
              {/* {setImage('')} */}
              <Image
                loader={myLoader}
                src={imageToPost as string}
                className="mt-10 h-40 w-full rounded-xl object-contain shadow-lg"
                alt=""
              />
              <p
                className="text-center text-xs text-red-500"
                onClick={removeImage}
              >
                Remove
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default React.memo(TweetBox)
