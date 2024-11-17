"use client"

import Link from "next/link";
import { GrOverview } from "react-icons/gr";
import { FaDatabase } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";

import { useRef, useState } from "react";
import { renderIcon } from "@/lib/Common";
import { createWork, issuePresignedUrl, uploadFileS3 } from "@/lib/api";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function NewWork({ params }) {
  const router = useRouter();
  // パスパラメータ、クエリパラメータの取得
  const workId = params.id;
  const { idToken } = useAuth();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [caption, setCaption] = useState("");
  const [objectFiles, setObjectFiles] = useState([]);
  // サムネイル画像管理用ステート変数
  const [thumImage, setThumImage] = useState(null);
  const [thumPreviewUrl, setThumPreviewUrl] = useState(null);
  // オーディオデータ管理用ステート変数
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const objectFilesInputRef = useRef(null);
  const thumImageInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleObjectFilesButtonClick = () => {
    objectFilesInputRef.current.click();
  }

  const handleThumImageButtonClick = () => {
    thumImageInputRef.current.click();
  }

  const handleAudioFileButtonClick = () => {
    audioFileInputRef.current.click();
  }

  // オブジェクトファイル更新
  const handleUpdateObjectFiles = (event) => {
    const files = Array.from(event.target.files);
    console.log(files);
    setObjectFiles(prevFiles => [...prevFiles, ...files]);
  }

  // オブジェクトファイル削除
  const handleRemoveObjectFiles = (fileName) => {
    // objectFilesからファイル名の異なるものを抽出して、tmpObjectFilesに設定
    const tmpObjectFiles = objectFiles.filter((file) => file.name !== fileName);
    // tmpObjectFilesをobjectFilesとして設定
    setObjectFiles(tmpObjectFiles);
  }

  // サムネイルイメージ更新
  const handleUpdateThumImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumImage(file);
      setThumPreviewUrl(URL.createObjectURL(file));
    }
  }

  // サムネイルイメージ削除
  const handleRemoveThumImage = () => {
    setThumImage(null);
    setThumPreviewUrl(null);
    thumImageInputRef.current.value="";
  }

  // オーディオファイル更新
  const handleUpdateAudioFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  }

  // オーディオファイル削除
  const handleRemoveAudioFile = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    audioFileInputRef.current.value="";
  }

  // オーディオファイルの再生&停止
  const handleTogglePlayback = () => {
    if (isAudioPlaying) {
      audioRef.current.pause();
    }
    else {
      audioRef.current.play();
    }
    setIsAudioPlaying(!isAudioPlaying);
  }

  // 書名URLを用いたS3へのファイルアップロード
  const uploadFile = async(file) => {
    // ファイルがnullの場合、終了
    if (file === null) return;

    const issuePresignedUrlRes = await issuePresignedUrl(idToken, workId, file.name, file.type);
    if (issuePresignedUrlRes.status === 200) {
      const presignedUrl = issuePresignedUrlRes.data.url;
      try {
        const uploadS3Res = await uploadFileS3(presignedUrl, file);
        if (uploadS3Res.status !== 200) {
          console.log(uploadS3Res);
          console.log(`${file.name} has failed to been uploaded to S3.`);
        }
      }
      catch (error) {
        console.error(error);
      }
    }
    else {
      console.log(issuePresignedUrlRes);
      console.log("Failed to issue presigned url.")
    }
  }

  // 保存
  const handleSubmit = async() => {
    try {
      // 現在日時の文字列取得
      const currentDateTime = new Date().toISOString();
      // 基本情報の登録
      await createWork(idToken, workId, title, caption, currentDateTime);
      // オブジェクトファイルのアップロード
      if (objectFiles.length !== 0) {
        for (let i=0; i<objectFiles.length; i++) {
          const file = objectFiles[i];
          await uploadFile(file);
        }
      }
      // サムネイルイメージのアップロード
      await uploadFile(thumImage);
      // オーディオファイルのアップロード
      await uploadFile(audioFile);
      // 成功トースト表示
      toast.success("Successfully a new work has been created!", { duration: 3000 });
      // Adminトップに遷移
      router.push("/admin");
    } catch (error) {
      // 失敗トースト表示
      toast.error("Failed to create a new work.", { duration: 3000 })
      console.error(error);
    }
  }

  return (
    <div className="relative flex flex-col gap-5 p-10 h-full">
      <div className="flex flex-row items-center gap-5 text-slate-100">
        <Link href="/admin"><h1 className="font-mono text-4xl font-bold">AdminArea</h1></Link>
        <h1 className="font-mono text-4xl font-bold">{"-> New"}</h1>
      </div>
      {/* コンテンツ全体 */}
      <div className="flex flex-row mb-5 overflow-y-scroll">
        {/* OverView */}
        <div className="flex flex-col p-8 w-1/2 border-r-2 border-dotted border-slate-500">
          {/* サブタイトル */}
          <div className="flex items-center gap-3 text-slate-100">
            <GrOverview size={30} />
            <h2 className="font-mono text-3xl font-bold">
              OverView
            </h2>
          </div>
          {/* Title編集エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <h2 className="font-mono text-xl font-bold">
                Title
              </h2>
            </div>
            <div className="my-3 p-3">
              <input 
                type="text" 
                value={title}
                className="bg-grey-400 placeholder-slate-200 text-slate-600 p-3 w-2/3 rounded-md outline-none hover:border-main-ac-color hover:shadow-xl hover:shadow-black scroll-auto"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          {/* Slug編集エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <h2 className="font-mono text-xl font-bold">
                Slug
              </h2>
            </div>
            <div className="my-3 p-3">
              <input 
                type="text" 
                value={slug}
                className="bg-grey-400 placeholder-slate-200 text-slate-600 p-3 w-2/3 rounded-md outline-none hover:border-main-ac-color hover:shadow-xl hover:shadow-black scroll-auto"
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          {/* Caption編集エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <div>
                <h2 className="font-mono text-xl font-bold">Caption</h2>
              </div>
            </div>
            <div className="my-3 p-3">
              <textarea 
                value={caption}
                className="bg-grey-400 placeholder-slate-200 text-slate-600 p-3 w-2/3 h-72 rounded-md outline-none hover:border-main-ac-color hover:shadow-xl hover:shadow-black scroll-auto"
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* 詳細データ */}
        <div className="flex flex-col p-8 w-1/2">
          {/* サブタイトル */}
          <div className="flex items-center gap-3 text-slate-100">
            <FaDatabase size={30} />
            <h2 className="font-mono text-3xl font-bold">
              Detail Data
            </h2>
          </div>
          {/* Object Data編集エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <div>
                <h2 className="font-mono text-xl font-bold">Object Data</h2>
              </div>
              <button className="rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500" onClick={handleObjectFilesButtonClick}>
                <p className="p-2 font-mono text-sm">
                  Select
                </p>
              </button>  
            </div>
            <div className="my-3 p-3">
              <input multiple type="file" accept=".json" ref={objectFilesInputRef} className="hidden" onChange={handleUpdateObjectFiles}></input>
              {
                objectFiles.map((file, index) => (
                  <div key={index} className="relative flex flex-row justify-between items-center gap-3 my-2 w-2/3 p-3 rounded-lg bg-slate-300">
                    <div className="flex flex-row items-center gap-3">
                      {renderIcon(file.name)}
                      <p className="font-mono text-sm">
                        {file.name}
                      </p>
                    </div>
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => handleRemoveObjectFiles(file.name)}
                    >
                      <IoClose size={20}/>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
          {/* Thumbnail Data編集エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <div>
                <h2 className="font-mono text-xl font-bold">Tumbnail Data</h2>
              </div>
              <button className="rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500" onClick={handleThumImageButtonClick}>
                <p className="p-2 font-mono text-sm">
                  Select
                </p>
              </button>
            </div>
            <div className="my-3 p-3">
              <input type="file" accept="image/*,video/*" ref={thumImageInputRef} className="hidden" onChange={handleUpdateThumImage}></input>
              { thumPreviewUrl && 
                <div className="size-2/12">
                  <p className="font-mono text-lg font-bold">Preview</p>
                  <div className="relative">
                    <img src={thumPreviewUrl} alt="Thumbnail Preview" className="w-full h-full"/>
                    <button
                      onClick={handleRemoveThumImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      <IoClose size={25}/>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
          {/* Audio Data編集エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <div>
                <h2 className="font-mono text-xl font-bold">Audio Data</h2>
              </div>
              <button className="rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500" onClick={handleAudioFileButtonClick}>
                <p className="p-2 font-mono text-sm">
                  Select
                </p>
              </button>
            </div>
            <div className="my-3 p-3">
              <input type="file" accept="audio/*" ref={audioFileInputRef} className="hidden" onChange={handleUpdateAudioFile}></input>
              {audioPreviewUrl && (
                <div className="flex flex-col items-center justify-center gap-5 p-3 size-2/12 rounded-lg bg-slate-300">
                  <div className="relative w-full h-1/4">
                  <button 
                    onClick={handleRemoveAudioFile}
                    className="absolute top-0 right-1 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    <IoClose size={25}/>
                  </button>
                  </div>
                  <button onClick={handleTogglePlayback}>
                    {isAudioPlaying ? 
                      <FaPause size={25} />
                      :
                      <FaPlay size={25}/>
                    }
                  </button>
                  <audio ref={audioRef} src={audioPreviewUrl} />
                  <p>{audioFile.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Submit */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <button 
          className="w-1/5 rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500"
          onClick={handleSubmit}
        >
          <p className="p-3 font-mono text-lg font-bold">
            Submit
          </p>
        </button>
      </div>
    </div>
  );
}
