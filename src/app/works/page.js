"use client"

import Link from "next/link";
import { IoMdTime } from "react-icons/io";
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getWorks } from "@/lib/api";

export default function Home() {
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
  
  return (
    <div className="p-8">
      <h1 className="font-mono text-4xl text-slate-100 font-bold">Works Area</h1>
      <div className="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {works.map((work, index) => (
          <Link href={`/works/${work.slug}`}>
            <div key={index} className="bg-base-color p-4 rounded-lg shadow-md shadow-black hover:shadow-2xl hover:shadow-black">
              <img src={work.thum_file.presigned_url} alt="Thumbnail Preview" className="w-full h-40 object-cover rounded-t-lg mb-4" />
              <h2 className="text-xl text-slate-100 font-semibold">{work.title}</h2>
              <p className="text-md text-slate-300">{work.caption}</p>
              <p className="flex flex-row gap-2 items-center text-sm text-slate-400 mt-4">
                <IoMdTime size={15}/>
                Updated at: {work.updated_at}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
