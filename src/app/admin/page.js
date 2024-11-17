"use client"

import { AiOutlinePlus } from "react-icons/ai";
import { AiFillProduct } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin7Line } from "react-icons/ri";
import { generateCurrentDateTimeHash } from "@/lib/Common";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/authContext";
import { deleteWork, getWorks } from "@/lib/api";

export default function Admin({}) {
  const router = useRouter();
  const { idToken } = useAuth();

  // Works一覧を管理するステート変数
  const [works, setWorks] = useState([]);

  // 初回レンダリング時に実行
  useEffect(() => {
    // Work一覧を取得して、Worksステート変数に格納
    const execGetWorks = async() => {
      try {
        const response = await getWorks(idToken);
        setWorks(response.data);
      } catch(error) {
        toast.error("Failed to fetch works.", { duration: 3000 })
      }
    }
    execGetWorks();
  }, [])

  // Work登録
  const handleCreateNewWork = async() => {
    const hash = await generateCurrentDateTimeHash();
    const workId = `ch_${hash}`;
    router.push(`/admin/new/${workId}`);
  }

  // Work編集
  const handleEditWork = (workId) => {
    router.push(`/admin/edit/${workId}`);
  }

  // Work削除
  const handleDeleteWork = async(workId) => {
    try {
      await deleteWork(idToken, workId);
      // 削除されたWorkを除去した一時的なworks変数を作成
      const newWorks = works.filter((work) => work.work_id !== workId);
      // works更新
      setWorks(newWorks);
      toast.success("Successfully the work has been deleted!", { duration: 3000 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete the work.", { duration: 3000 });
    }
  }

  return (
    <div className="p-8">
      <h1 className="font-mono text-4xl text-slate-100 font-bold">Admin Area</h1>   
      <div className="flex flex-col">
        {/* 全体操作 */}
        <div className="flex justify-end my-5">
          <button 
            className="flex flex-row items-center gap-3 p-3 rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500"
            onClick={handleCreateNewWork}
          >
            <AiOutlinePlus size={25}/>
            <p className="font-mono text-lg font-bold">
              New
            </p>
          </button>
        </div>
        {/* 作品一覧 */}
        <div className="flex flex-col gap-10 my-10">
          <div className="flex flex-row gap-3 items-center text-slate-100">
            <AiFillProduct size={25} />
            <h2 className="font-mono text-2xl font-bold">
              Works
            </h2>
          </div>
          <table className="table-auto w-full font-mono">
            <thead>
              <tr className="bg-main-ac-color text-xl text-slate-300 font-bold">
              <th className="p-3 border-collapse border border-slate-400 text-left">Work ID</th>
                <th className="p-3 border-collapse border border-slate-400 text-left">Thumbnail</th>
                <th className="p-3 border-collapse border border-slate-400 text-left">Title</th>
                <th className="p-3 border-collapse border border-slate-400 text-left">Slug</th>
                <th className="p-3 border-collapse border border-slate-400 text-left">Caption</th>
                <th className="p-3 border-collapse border border-slate-400 text-left">Updated At</th>
                <th className="p-3 border-collapse border border-slate-400 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work, id) => (
                <tr className="text-md text-slate-300" key={id}>
                  <td className="p-1 border-collapse border border-slate-400">{work.work_id.substring(0, 15) + "..."}</td>
                  <td className="p-1 border-collapse border border-slate-400">
                    <img src={work.thum_file.presigned_url} alt="Thumbnail Preview" className="size-24 object-cover"/>
                  </td>
                  <td className="p-1 border-collapse border border-slate-400">{work.title}</td>
                  <td className="p-1 border-collapse border border-slate-400">{work.slug}</td>
                  <td className="p-1 border-collapse border border-slate-400">{work.caption}</td>
                  <td className="p-1 border-collapse border border-slate-400">{work.updated_at}</td>
                  <td className="p-1 border-collapse border border-slate-400">
                    <div className="flex flex-row justify-center gap-5">
                      {/* Edit */}
                      <button
                        className="flex flex-row items-center gap-3 p-3 rounded-lg bg-main-ac-color hover:bg-slate-500"
                        onClick={() => handleEditWork(work.work_id)}
                      >
                        <FaEdit className="text-slate-100" size={25} />
                      </button>
                      {/* Delete */}
                      <button 
                        className="flex flex-row items-center gap-3 p-3 rounded-lg bg-main-ac-color hover:bg-slate-500"
                        onClick={() => handleDeleteWork(work.work_id)}
                      >
                        <RiDeleteBin7Line className="text-slate-100" size={25} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
