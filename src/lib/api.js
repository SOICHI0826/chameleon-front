"use client"
import axios from "axios";

// 環境変数読み込み
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log(apiBaseURL);

// ログインAPI
export async function login(userId, password) {
    // 引数のフォーマット
    const bodyJson = JSON.stringify({ userId, password });
    // API実行情報の定義
    const config = {
        method: "post",
        url: apiBaseURL + "/auth",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: bodyJson,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
    }
    return response;
}

// ChallengeログインAPI
export async function challengeLogin(userId, newPassword, sessionId, challengeName) {
    // 引数のフォーマット
    const bodyJson = JSON.stringify({ userId, newPassword, sessionId, challengeName });
    // API実行情報の定義
    const config = {
        method: "put",
        url: apiBaseURL + "/auth",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: bodyJson,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
    }
    return response;
}

// Work一覧取得API
export async function getWorks(idToken) {
    // API実行情報の定義
    const config = {
        method: "get",
        url: apiBaseURL + "/work",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return response;
}

// Work詳細取得API
export async function getWork(idToken, workId) {
    // API実行情報の定義
    const config = {
        method: "get",
        url: apiBaseURL + "/work" + `?work_id=${workId}`,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
    }
    return response;
}

// Work作成API
export async function createWork(idToken, workId, title, slug, caption, updatedAt) {
    // 引数のフォーマット
    const bodyJson = JSON.stringify({ workId, title, slug, caption, updatedAt });
    // API実行情報の定義
    const config = {
        method: "post",
        url: apiBaseURL + "/work",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        data: bodyJson,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return response;
}

// Work更新API
export async function updateWork(idToken, workId, title, slug, caption, updatedAt, delObjectFiles, delThumImage, delAudioFile) {
    // 引数のフォーマット
    const bodyJson = JSON.stringify({ workId, title, slug, caption, updatedAt, delObjectFiles, delThumImage, delAudioFile });
    // API実行情報の定義
    const config = {
        method: "put",
        url: apiBaseURL + "/work",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        data: bodyJson,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
    }
    return response;
}

// Work削除API
export async function deleteWork(idToken, workId) {
    // 引数のフォーマット
    const bodyJson = JSON.stringify({ workId });
    // API実行情報の定義
    const config = {
        method: "delete",
        url: apiBaseURL + "/work",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        data: bodyJson,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
    }
    return response;
}

// PresingedURL発行API
export async function issuePresignedUrl(idToken, workId, fileName, contentType) {
    // 引数のフォーマット
    const bodyJson = JSON.stringify({ workId, fileName, contentType });
    // API実行情報の定義
    const config = {
        method: "post",
        url: apiBaseURL + "/work/presigned-url",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
        },
        data: bodyJson,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
    }
    return response;
}

// S3へのファイルアップロード
export async function uploadFileS3(presignedUrl, file) {
    // API実行情報の定義
    const config = {
        method: "put",
        url: presignedUrl,
        headers: {
            "Content-Type": file.type
        },
        data: file,
        timeout: 60000,
    };
    let response = null;
    try {
        response = await axios(config);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return response;
}