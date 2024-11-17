import { BsFiletypeJson } from "react-icons/bs";
import { BsFiletypeJpg } from "react-icons/bs";
import { BsFiletypePng } from "react-icons/bs";
import { BsFiletypeMp3 } from "react-icons/bs";
import { BsFiletypeMp4 } from "react-icons/bs";
import { BsFiletypeWav } from "react-icons/bs";
import { AiOutlineFileUnknown } from "react-icons/ai";
import { issuePresignedUrl, uploadFileS3 } from "./api";

// 現在日時の文字列からハッシュ値を生成する関数（WorkIDとして利用）
export async function generateCurrentDateTimeHash() {
  // 現在日時をISO形式の文字列として取得
  const currentDateTime = new Date().toISOString();
  
  // テキストをエンコードしてバイト配列に変換
  const encoder = new TextEncoder();
  const data = encoder.encode(currentDateTime);
  
  // SHA-256ハッシュを作成
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // バイト配列を16進数の文字列に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ファイル名の拡張子から適切なアイコンを返却する
export const renderIcon = (fileName) => {
  // ファイル名から拡張子を小文字で取得
  const extension = fileName.split(".").pop().toLowerCase();        
  
  switch(extension) {
    case "json":
        return <BsFiletypeJson size={25}/>;
    case "jpg" || "jpeg":
        return <BsFiletypeJpg size={25} />;
    case "png":
        return <BsFiletypePng size={25} />;
    case "mp3":
        return <BsFiletypeMp3 size={25} />;
    case "mp4":
        return <BsFiletypeMp4 size={25} />;
    case "wav":
        return <BsFiletypeWav size={25} />;
    default:
        return <AiOutlineFileUnknown size={25} />;
  }
};

// 書名URLを用いたS3へのファイルアップロード
export const uploadFile = async(idToken, workId, file) => {
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
      throw error;
    }
  }
  else {
    console.log(issuePresignedUrlRes);
    console.log("Failed to issue presigned url.")
  }
}