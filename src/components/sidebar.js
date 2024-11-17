"use client"
import logo from "@/assets/logo.svg";
import Link from 'next/link';
import { CiHome } from "react-icons/ci";
import { AiFillProduct } from "react-icons/ai";
import { TiSpanner } from "react-icons/ti";
import { RiLoginBoxFill } from "react-icons/ri";
import { useAuth } from "@/contexts/authContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Sidebar() {
  const { userId } = useAuth();
  const pathName = usePathname();

  const isActive = (path) => pathName === path;
  useEffect(() => {
      console.log(pathName);
  }, [])
  
  return (
    <div className={"flex h-screen w-64 mx-1 transition-width duration-300 bg-main-ac-color rounded-2xl"}>
      {/* Sidebar content */}
      <div className="flex flex-col gap-10 w-full p-4">
        {/* Logo */}
        <Link href="/">
          <div className="cursor-pointer mb-8">
            <img 
              src={logo.src} 
              alt="chameleon" 
              className="rounded-2xl p-4 hover:shadow-xl"
            />
          </div>
        </Link>
        {/* Home Menu */}
        <Link href="/">
          <div className={`flex items-center gap-5 p-3 cursor-pointer ${isActive("/") ? "text-slate-100" : "text-slate-400"} hover:text-slate-100 hover:shadow-lg`}>
            <CiHome size={30}/>
            <p className="font-mono text-xl">
              Home
            </p>
          </div>
        </Link>
        {/* Works Menu */}
        <Link href="/works">
          <div className={`flex items-center gap-5 p-3 cursor-pointer ${isActive("/works") ? "text-slate-100" : "text-slate-400"} hover:text-slate-100 hover:shadow-lg`}>
            <AiFillProduct size={30}/>
            <p className="font-mono text-xl">
              Works
            </p>
          </div>
        </Link>
        {/* Admin Area */}
        {userId !== null &&
          <Link href="/admin">
            <div className={`flex items-center gap-5 p-3 cursor-pointer ${isActive("/admin") ? "text-slate-100" : "text-slate-400"} hover:text-slate-100 hover:shadow-lg`}>
              <TiSpanner size={30}/>
              <p className="font-mono text-xl">
                Admin
              </p>
            </div>
          </Link>
        }
        {/* Login */}
        {userId === null &&
          <Link href="/login">
            <div className={`flex items-center gap-5 p-3 cursor-pointer ${isActive("/login") ? "text-slate-100" : "text-slate-400"} hover:text-slate-100 hover:shadow-lg`}>
              <RiLoginBoxFill size={30}/>
              <p className="font-mono text-xl">
                Login
              </p>
            </div>
          </Link>
        }
      </div>
    </div>
  );
};
