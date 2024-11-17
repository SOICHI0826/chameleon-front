"use client"

import { useState } from "react";
import toast from "react-hot-toast";

import logo from "@/assets/logo.svg";
import { useAuth } from "@/contexts/authContext";
import { login, challengeLogin } from "@/lib/api";
import { useRouter } from "next/navigation";

function Login() {
  // 通常の認証
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // チャレンジ認証
  const [password2, setPassword2] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [challengeName, setChallengeName] = useState("");
  const [type, setType] = useState("auth");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const router = useRouter();

  const { authLogin } = useAuth();
  
  const handleLogin = async() => {
    setIsLoggingIn(true);
    const response = await login(userId, password);
    if (response.status === 200) {
      if (response.data.type === "auth success") {
        const authInfo = {
          "userId": userId,
          "idToken": response.data.id_token,
          "accessToken": response.data.access_token,
          "refreshToken": response.data.refresh_token
        };
        authLogin(authInfo);
        setIsLoggingIn(false);
        router.push("/");
        toast.success("You have successfully Logged In!", { duration: 3000 });
      }
      else if (response.data.type === "new passsword required") {
        setPassword("");
        setSessionId(response.data.session);
        setChallengeName(response.data.challengeName);
        setType("challenge"); 
        setIsLoggingIn(false);
      }
    }
    else {
      console.error(response.data.message);
      setIsLoggingIn(false);
      setUserId("");
      setPassword("");
      router.push("/login");
      toast.error("You have failed to Log In.", { duration: 3000 });
    }
  };
  
  const handleChallenge = async() => {
    if (password !== password2) {
      toast.error("You passwords don't match.", { duration: 3000 });
      return;
    }
    setIsLoggingIn(true);
    const response = await challengeLogin(userId, password, sessionId, challengeName);
    if (response.status == 200) {
      const authInfo = {
        "userId": userId,
        "idToken": response.data.id_token,
        "accessToken": response.data.access_token,
        "refreshToken": response.data.refresh_token
      };
      authLogin(authInfo);
      router.push("/");
      setIsLoggingIn(false);
      toast.success("You have successfully Logged In!", { duration: 3000 });
    }
    else {
      console.error(response.data.message);
      setIsLoggingIn(false);
      setUserId("");
      setPassword("");
      setPassword2("");
      router.push("/login");
      toast.error("You have failed to Log In.", { duration: 3000 });
    }
  };
  
  return (
    <div className="flex justify-center items-center h-full">
      { type !== "challenge" ? 
        <div className="flex flex-col justify-center items-center gap-10 w-1/3 h-1/2 rounded-lg border-4 border-double border-main-ac-color">
          { isLoggingIn ?
            <span className="text-slate-100">Logging in ...</span>
            :
            <>
              <img 
                src={logo.src} 
                alt="chameleon"
                className="w-1/5 h-1/5"
              />
              <input
                label="User Id" 
                value={userId} 
                placeholder="User Id" 
                className="bg-grey-400 placeholder-slate-200 text-slate-600 font-bold p-3 w-1/2 rounded-md outline-none hover:border-main-ac-color hover:shadow-xl hover:shadow-black scroll-auto"
                onChange={(e) => setUserId(e.target.value)} 
              />
              <input 
                type="password" 
                label="Password" 
                value={password} 
                placeholder="Password" 
                className="bg-grey-400 placeholder-slate-200 text-slate-600 font-bold p-3 w-1/2 rounded-md outline-none hover:border-main-ac-color hover:shadow-xl hover:shadow-black scroll-auto"
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button 
                className="w-1/3 rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500"
                onClick={handleLogin}
              >
                <p className="p-2 font-mono text-lg font-bold">
                  Login
                </p>
              </button>
            </>
          }
        </div>
        :
        <div className="flex flex-col justify-center items-center gap-10 w-1/3 h-1/2 rounded-lg border-2 border-main-ac-color">
          { isLoggingIn ?
            <span>Logging in ...</span>
            :
            <>
              <p className="font-mono text-2xl font-bold">New password required 👋</p>
              <input 
                type="password" 
                label="Password" 
                value={password} 
                placeholder="Password" 
                className="bg-grey-200 p-3 w-1/2 rounded-md outline-none border-2 border-main-ac-color focus:bg-grey-100 hover:bg-grey-100 scroll-auto"
                onChange={(e) => setPassword(e.target.value)} 
              />
              <input 
                type="password" 
                label="Password" 
                value={password2} 
                placeholder="Password" 
                className="bg-grey-200 p-3 w-1/2 rounded-md outline-none border-2 border-main-ac-color focus:bg-grey-100 hover:bg-grey-100 scroll-auto"
                onChange={(e) => setPassword2(e.target.value)} 
              />
              <button
                className="w-1/3 rounded-lg bg-main-ac-color text-grey-300 hover:bg-slate-500"
                onClick={handleChallenge}
              >
                <p className="p-2 font-mono text-lg font-bold">
                  Renew Password
                </p>
              </button>
            </>
          }
        </div>
      }
    </div>
  );
}

export default Login;
