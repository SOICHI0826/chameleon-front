"use client"

import Link from "next/link";
import { GrOverview } from "react-icons/gr";
import { FaDatabase } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";

import { useEffect, useRef, useState } from "react";
import { renderIcon, uploadFile } from "@/lib/Common";
import { getWork, updateWork } from "@/lib/api";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EditWork({ params }) {
  const router = useRouter();
  // パスパラメータ、クエリパラメータの取得
  const workId = params.id;
  const { idToken } = useAuth();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [caption, setCaption] = useState("");
  // オブジェクトデータ管理用ステート変数
  const [initObjectFiles, setInitObjectFiles] = useState([]);
  const [objectFiles, setObjectFiles] = useState([]);
  // サムネイル画像管理用ステート変数
  const [initThumImage, setInitThumImage] = useState(null);
  const [thumImage, setThumImage] = useState(null);
  const [thumPreviewUrl, setThumPreviewUrl] = useState(null);
  // オーディオデータ管理用ステート変数
  const [initAudioFile, setInitAudioFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const objectFilesInputRef = useRef(null);
  const thumImageInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const audioRef = useRef(null);

  // 初回レンダリング時に実行
  useEffect(() => {
    const execGetWork = async() => {
      try {
        const response = await getWork(idToken, workId);
        // 初期データ設定
        setInitObjectFiles(response.data[0].obj_files);
        setInitThumImage(response.data[0].thum_file);
        setInitAudioFile(response.data[0].audio_file);
        // 現データ設定
        setTitle(response.data[0].title);
        setSlug(response.data[0].slug);
        setCaption(response.data[0].caption);
        setObjectFiles(response.data[0].obj_files);
        setThumImage(response.data[0].thum_file);
        setThumPreviewUrl(response.data[0].thum_file.presigned_url);
        setAudioFile(response.data[0].audio_file);
        setAudioPreviewUrl(response.data[0].audio_file.presigned_url);
      } catch(error) {
        toast.error("Failed to fetch works.", { duration: 3000 });
      }
    }
    execGetWork();
  }, [])

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

  // ファイル分類（新規追加ファイルと削除ファイルの分類）
  const categorizeFiles = async() => {
    console.log("categorizeFiles");
    console.log(objectFiles);
    console.log(initObjectFiles);
    console.log(thumImage);
    console.log(initThumImage);
    let tmpAddObjectFiles = [];
    let tmpDelObjectFiles = [];
    // オブジェクトファイルの分類
    // 追加オブジェクト（objectFilesに含まれているが、initObjectFilesには含まれない）
    for (let i=0; i < objectFiles.length; i++) {
      // 選択中ファイル
      const selectedFile = objectFiles[i];
      // initObjectFilesに選択中ファイルが含まれる場合はtrue、含まれない場合はfalse
      const isIncluded = initObjectFiles.some((initFile) => initFile.name === selectedFile.name);
      // initObjectFilesに選択中ファイルが含まれない場合は、追加ファイルと判定
      if (!isIncluded) {
        tmpAddObjectFiles.push(selectedFile)
      }
    }
    // 削除オブジェクト（initObjectFilesには含まれているが、objectFilesには含まれない）
    for (let i=0; i < initObjectFiles.length; i++) {
      // 初期ファイル
      const initFile = initObjectFiles[i];
      // objectFilesに初期ファイルが含まれる場合はtrue、含まれない場合はfalse
      const isIncluded = objectFiles.some((selectedFile) => selectedFile.name === initFile.name);
      // objectFilesに初期ファイルが含まれない場合は、削除ファイルと判定
      if (!isIncluded) {
        tmpDelObjectFiles.push(initFile);
      }
    }
    const addThumImage = initThumImage.name !== thumImage.name ? thumImage : null;
    const delThumImage = initThumImage.name !== thumImage.name ? initThumImage : null;
    const addAudioFile = initAudioFile.name !== audioFile.name ? audioFile : null;
    const delAudioFile = initAudioFile.name !== audioFile.name ? initAudioFile : null;

    console.log(addThumImage);
    console.log(delThumImage);

    return {
      addObjectFiles: tmpAddObjectFiles,
      delObjectFiles: tmpDelObjectFiles,
      addThumImage,
      delThumImage,
      addAudioFile,
      delAudioFile,
    };
  };

  // 保存
  const handleSave = async() => {
    try {
      // 現在日時の文字列取得
      const currentDateTime = new Date().toISOString();
      // ファイル分類
      const { addObjectFiles, delObjectFiles, addThumImage, delThumImage, addAudioFile, delAudioFile } = await categorizeFiles();
      // 基本情報の登録
      await updateWork(idToken, workId, title, caption, currentDateTime, delObjectFiles, delThumImage, delAudioFile);
      // オブジェクトファイルのアップロード
      if (addObjectFiles !== null) {
        for (let i=0; i<addObjectFiles.length; i++) {
          const file = addObjectFiles[i];
          await uploadFile(idToken, workId, file);
        }
      }
      // 追加サムネイルイメージのアップロード
      if (addThumImage !== null) {
        await uploadFile(idToken, workId, addThumImage);
      }
      // 追加オーディオファイルのアップロード
      if (addAudioFile !== null) {
        await uploadFile(idToken, workId, addAudioFile);
      }
      // 成功トースト表示
      toast.success("Successfully the work has been updated!", { duration: 3000 });
      // Adminトップに遷移
      router.push("/admin");
    } catch (error) {
      // 失敗トースト表示
      toast.error("Failed to update the work.", { duration: 3000 })
      console.error(error);
    }
  }

  return (
    <div className="relative flex flex-col gap-5 p-10 h-full">
      <div className="flex flex-row items-center gap-5 text-slate-100">
        <Link href="/admin"><h1 className="font-mono text-4xl font-bold">AdminArea</h1></Link>
        <h1 className="font-mono text-4xl font-bold">{"-> Edit"}</h1>
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
          {/* WorkId参照エリア */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-slate-100">
              <GoDotFill size={20} />
              <h2 className="font-mono text-xl font-bold">
                Work Id
              </h2>
            </div>
            <div className="my-3 p-3">
              <input 
                type="text" 
                value={workId}
                className="bg-grey-400 placeholder-slate-200 text-slate-600 p-3 w-2/3 rounded-md outline-none hover:border-main-ac-color scroll-auto"
                readonly
              />
            </div>
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
                    </div >
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
        {/* Submit */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <button 
            className="w-1/5 rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500"
            onClick={handleSave}
          >
            <p className="p-3 font-mono text-lg font-bold">
              Save
            </p>
          </button>
        </div>   
      </div>
    </div>
  );
}
