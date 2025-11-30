/**
 * =================================================================================
 * 项目: mixhub-2api (Cloudflare Worker 单文件版)
 * 版本: 1.0.0 (代号: Vercel Protocol Adapter)
 * 作者: 首席AI执行官 (Principal AI Executive Officer)
 * 协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
 * 日期: 2025-12-01
 * 
 * [核心特性]
 * 1. [协议转换] 将 Vercel AI SDK 的特殊流式协议 (0:"text") 实时转换为 OpenAI SSE 格式。
 * 2. [结构适配] 自动将 OpenAI 的 messages 转换为 MixHub 需要的 parts 结构。
 * 3. [模型提取] 内置从源码分析出的完整模型列表 (包含 GPT-5, Claude 3.7 等)。
 * 4. [驾驶舱] 集成高级 Web UI，支持实时调试 Vercel 流协议。
 * =================================================================================
 */

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "mixhub-2api",
  PROJECT_VERSION: "1.0.0",

  // 安全配置 (建议在 Cloudflare 环境变量中设置 API_MASTER_KEY)
  API_MASTER_KEY: "1",

  // 上游服务配置
  UPSTREAM_ORIGIN: "https://mixhubai.com",
  UPSTREAM_API_URL: "https://mixhubai.com/api/chat",

  // --- [关键配置] 凭证 (必须设置) ---
  // 从你的抓包数据中提取的 Cookie。
  // 如果遇到 403 或 积分不足，请在浏览器重新登录并更新此处的 Cookie。
  MIXHUB_COOKIE: "_gcl_au=1.1.526196572.1764532214; _ga=GA1.1.1058662080.1764532215; MANUAL_LOCALE=zh; sidebar_state=false; sb-qppzueshqwpwaaazyiwf-auth-token.0=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SWpOblIxb3lia05CUldsTk1pOW5PV1FpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDNGd2NIcDFaWE5vY1hkd2QyRmhZWHA1YVhkbUxuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSXlaalJqTW1aallpMWlPREZrTFRSaE1USXRZak0yWkMwMk0yWmlZemMyWlRBMU5UUWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpZME5UTTFPVE0zTENKcFlYUWlPakUzTmpRMU16SXpNemNzSW1WdFlXbHNJam9pY1RFek5qUTFPVFEzTkRBM1FHZHRZV2xzTG1OdmJTSXNJbkJvYjI1bElqb2lJaXdpWVhCd1gyMWxkR0ZrWVhSaElqcDdJbkJ5YjNacFpHVnlJam9pWjI5dloyeGxJaXdpY0hKdmRtbGtaWEp6SWpwYkltZHZiMmRzWlNKZGZTd2lkWE5sY2w5dFpYUmhaR0YwWVNJNmV5SmhkbUYwWVhKZmRYSnNJam9pYUhSMGNITTZMeTlzYURNdVoyOXZaMnhsZFhObGNtTnZiblJsYm5RdVkyOXRMMkV2UVVObk9HOWpTM2ROV2twWVMwMVBjekJTWDBGM1NFdFZRVzlmYkVvNWNGTmFiWEo2VjB4VU4xOW5XVUZrZWtNeFNXSlhXWEZCUFhNNU5pMWpJaXdpWlcxaGFXd2lPaUp4TVRNMk5EVTVORGMwTURkQVoyMWhhV3d1WTI5dElpd2laVzFoYVd4ZmRtVnlhV1pwWldRaU9uUnlkV1VzSW1aMWJHeGZibUZ0WlNJNkl1V0lxZVM3bENJc0ltbHpjeUk2SW1oMGRIQnpPaTh2WVdOamIzVnVkSE11WjI5dloyeGxMbU52YlNJc0ltNWhiV1VpT2lMbGlLbmt1NVFpTENKd2FHOXVaVjkyWlhKcFptbGxaQ0k2Wm1Gc2MyVXNJbkJwWTNSMWNtVWlPaUpvZEhSd2N6b3ZMMnhvTXk1bmIyOW5iR1YxYzJWeVkyOXVkR1Z1ZEM1amIyMHZZUzlCUTJjNGIyTkxkMDFhU2xoTFRVOXpNRkpmUVhkSVMxVkJiMTlzU2psd1UxcHRjbnBYVEZRM1gyZFpRV1I2UXpGSllsZFpjVUU5Y3prMkxXTWlMQ0p3Y205MmFXUmxjbDlwWkNJNklqRXdNakl6TXpnM01Ua3lOamMzTWpJeU5EQTRPU0lzSW5OMVlpSTZJakV3TWpJek16ZzNNVGt5TmpjM01qSXlOREE0T1NKOUxDSnliMnhsSWpvaVlYVjBhR1Z1ZEdsallYUmxaQ0lzSW1GaGJDSTZJbUZoYkRFaUxDSmhiWElpT2x0N0ltMWxkR2h2WkNJNkltOWhkWFJvSWl3aWRHbHRaWE4wWVcxd0lqb3hOelkwTlRNeU16TTNmVjBzSW5ObGMzTnBiMjVmYVdRaU9pSTVOV1V5TkdZeE5pMDBabVU1TFRRMk5tSXRZamt5WVMwMk5UYzVNemsxTnpZNVlqUWlMQ0pwYzE5aGJtOXVlVzF2ZFhNaU9tWmhiSE5sZlEudm1YdDZmZW5BamJsRHY3UEFlWHRtRDZ4MHgzUDlZZmhiN3R5cWMwN18yOCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzY0NTM1OTM3LCJyZWZyZXNoX3Rva2VuIjoibTMzZzZpMzdoZzRwIiwidXNlciI6eyJpZCI6IjJmNGMyZmNiLWI4MWQtNGExMi1iMzZkLTYzZmJjNzZlMDU1NCIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoicTEzNjQ1OTQ3NDA3QGdtYWlsLmNvbSIsImVtYWlsX2NvbmZpcm1lZF9hdCI6IjIwMjUtMTEtMzBUMTk6NTI6MTYuOTg5MDczWiIsInBob25lIjoiIiwiY29uZmlybWVkX2F0IjoiMjAyNS0xMS0zMFQxOTo1MjoxNi45ODkwNzNaIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNS0xMS0zMFQxOTo1MjoxNy44ODQzNjY0MDVaIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ29vZ2xlIiwicHJvdmlkZXJzIjpbImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS3dNWkpYS01PczBSX0F3SEtVQW9fbEo5cFNabXJ6V0xUN19nWUFkekMxSWJXWXFBPXM5Ni1jIiwiZW1haWwiOiJxMTM2NDU5NDc0MDdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IuWIqeS7lCIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiLliKnku5QiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLd01aSlhLTU9zMFJfQXdIS1VBb19sSjlwU1ptcnpXTFQ3X2dZQWR6QzFJYldZcUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwMjIzMzg3MTkyNjc3MjIyNDA4OSIsInN1YiI6IjEwMjIzMzg3MTkyNjc3MjIyNDA4OSJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjQzYmJiMjQxLWY2MjAtNDc5OC1hMzhhLWZmMWI0YjAyMzE0NCIsImlkIjoiMTAyMjMzODcxOTI2NzcyMjI0MDg5IiwidXNlcl9pZCI6IjJmNGMyZmNiLWI4MWQtNGExMi1iMzZkLTYzZmJjNzZlMDU1NCIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX; sb-qppzueshqwpwaaazyiwf-auth-token.1=3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0t3TVpKWEtNT3MwUl9Bd0hLVUFvX2xKOXBTWm1yeldMVDdfZ1lBZHpDMUliV1lxQT1zOTYtYyIsImVtYWlsIjoicTEzNjQ1OTQ3NDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiLliKnku5QiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoi5Yip5LuUIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS3dNWkpYS01PczBSX0F3SEtVQW9fbEo5cFNabXJ6V0xUN19nWUFkekMxSWJXWXFBPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMDIyMzM4NzE5MjY3NzIyMjQwODkiLCJzdWIiOiIxMDIyMzM4NzE5MjY3NzIyMjQwODkifSwicHJvdmlkZXIiOiJnb29nbGUiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTExLTMwVDE5OjUyOjE2Ljk2MjAxMVoiLCJjcmVhdGVkX2F0IjoiMjAyNS0xMS0zMFQxOTo1MjoxNi45NjIwNjVaIiwidXBkYXRlZF9hdCI6IjIwMjUtMTEtMzBUMTk6NTI6MTYuOTYyMDY1WiIsImVtYWlsIjoicTEzNjQ1OTQ3NDA3QGdtYWlsLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjUtMTEtMzBUMTk6NTI6MTYuOTI0NDg2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTExLTMwVDE5OjUyOjE3LjkxODEyNFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwicHJvdmlkZXJfdG9rZW4iOiJ5YTI5LmEwQVRpNksyc0R6ZW5uYm9NRU5VZXdGQnR6dXJMQlMyRDhyUzRubEJnZ20xSWp0c1ZqM2JBOXloX2RYLWdsQ2RfQk4zWjVsUjNKbENqd3l1ajJubTliQS1ha2JwTlNfNG9zSGpBa211dEdKRnQ4aWI5T0MxTlJQR1R4MVBuZ0lLelRPSGNKMTg4MVpXdHg2VmhKREljMncwdUs0T1JXbnpOWVNBdDZPVjA5aU9ibXZhaUVWckd2V254dGVicHMyMWp1ektrcnRmOGFDZ1lLQVNRU0FSY1NGUUhHWDJNaW1tNjJLOU9QQ0JxYm90NHFSOUFDRWcwMjA2In0; NEXT_LOCALE=zh; _ga_ZZ8G2B03FS=GS2.1.s1764532214$o1$g1$t1764532342$j7$l0$h0",

  // 伪装头
  HEADERS: {
    "Host": "mixhubai.com",
    "Origin": "https://mixhubai.com",
    "Referer": "https://mixhubai.com/zh/ai-models/gemini-3",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "priority": "u=1, i"
  },

  // 模型列表 (从源码提取)
  // 建议使用 gpt-5-codex 或 gemini-2.5-flash 以节省积分
  MODELS: [
    "openai/gpt-5-codex", // 推荐：低消耗
    "openai/gpt-5-mini",
    "google/gemini-2.5-flash", // 推荐：低消耗
    "openai/gpt-5.1",
    "openai/gpt-5",
    "openai/gpt-5-chat",
    "openai/gpt-4o",
    "openai/gpt-oss-120b",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-sonnet-4",
    "anthropic/claude-3.7-sonnet",
    "anthropic/claude-opus-4.1",
    "google/gemini-3-pro-preview",
    "google/gemini-2.5-pro",
    "deepseek/deepseek-r1-0528",
    "deepseek/deepseek-chat-v3.1",
    "qwen/qwen3-max",
    "qwen/qwen3-next-80b-a3b-instruct",
    "minimax/minimax-m2",
    "x-ai/grok-4"
  ],
  DEFAULT_MODEL: "openai/gpt-5-codex"
};

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const cookie = env.MIXHUB_COOKIE || CONFIG.MIXHUB_COOKIE;
    
    request.ctx = { apiKey, cookie };

    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return handleCorsPreflight();
    if (url.pathname === '/') return handleUI(request);
    if (url.pathname.startsWith('/v1/')) return handleApi(request);
    
    return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
  }
};

// --- [第三部分: API 代理逻辑] ---

async function handleApi(request) {
  if (!verifyAuth(request)) {
    return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
  }

  const url = new URL(request.url);
  const requestId = `req-${crypto.randomUUID()}`;

  if (url.pathname === '/v1/models') {
    return handleModelsRequest();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else {
    return createErrorResponse(`不支持的 API 路径: ${url.pathname}`, 404, 'not_found');
  }
}

function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  const validKey = request.ctx.apiKey;
  if (validKey === "1") return true; 
  return authHeader && authHeader === `Bearer ${validKey}`;
}

function handleModelsRequest() {
  const modelsData = {
    object: 'list',
    data: CONFIG.MODELS.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'mixhub-2api',
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}

async function handleChatCompletions(request, requestId) {
  try {
    const body = await request.json();
    const model = body.model || CONFIG.DEFAULT_MODEL;
    const stream = body.stream !== false;

    // 1. 转换 Messages 结构
    // OpenAI: [{role: "user", content: "hi"}]
    // MixHub: [{"parts": [{"type": "text", "text": "hi"}], "role": "user", "id": "..."}]
    const mixhubMessages = (body.messages || []).map(msg => ({
      id: generateRandomId(16),
      role: msg.role,
      parts: [{ type: "text", text: msg.content }]
    }));

    // 2. 构造 MixHub Payload
    const mixhubPayload = {
      model: model,
      modelName: getModelName(model), // 辅助函数获取友好名称
      webSearch: true,
      maxOutputTokens: 6000,
      chatId: null,
      id: generateRandomId(16),
      messages: mixhubMessages,
      trigger: "submit-message"
    };

    // 3. 准备请求头
    const headers = {
      ...CONFIG.HEADERS,
      "Cookie": request.ctx.cookie
    };

    // 4. 发送请求
    const response = await fetch(CONFIG.UPSTREAM_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(mixhubPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = errorText;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.error) errorMsg = errJson.error;
      } catch(e) {}
      
      if (errorMsg.includes("Insufficient points")) {
        errorMsg += " (积分不足，请尝试切换到 gpt-5-codex 或 gemini-2.5-flash 等低消耗模型)";
      }
      
      return createErrorResponse(`上游服务错误 (${response.status}): ${errorMsg}`, response.status, 'upstream_error');
    }

    // 5. 流式处理 (Vercel AI SDK Protocol -> OpenAI SSE)
    if (stream) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      (async () => {
        try {
          const reader = response.body.getReader();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              
              // Vercel Protocol 解析
              // 格式通常是: 0:"text_content"
              const match = line.match(/^(\d+):(.*)$/);
              if (match) {
                const type = match[1];
                let contentRaw = match[2];
                
                // 类型 0 是文本增量
                if (type === '0') {
                  try {
                    // 去除首尾引号
                    if (contentRaw.startsWith('"') && contentRaw.endsWith('"')) {
                      contentRaw = JSON.parse(contentRaw);
                    }
                    const chunk = createChatCompletionChunk(requestId, model, contentRaw);
                    await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  } catch (e) {}
                } 
                // 类型 e 是错误或结束信息，这里我们主要关注文本流
              }
            }
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (e) {
          const errChunk = createChatCompletionChunk(requestId, model, `\n\n[Error: ${e.message}]`, "stop");
          await writer.write(encoder.encode(`data: ${JSON.stringify(errChunk)}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: corsHeaders({ 'Content-Type': 'text/event-stream' })
      });

    } else {
      // 非流式暂不支持，强制流式
      return createErrorResponse("请使用 stream=true 模式。", 400, 'invalid_request');
    }

  } catch (e) {
    return createErrorResponse(e.message, 500, 'internal_error');
  }
}

// --- 辅助函数 ---

function generateRandomId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function getModelName(modelId) {
  // 简单映射，用于 payload 中的 modelName 字段
  const map = {
    "openai/gpt-5-codex": "GPT 5 Codex",
    "google/gemini-2.5-flash": "Gemini 2.5 Flash"
  };
  return map[modelId] || modelId.split('/').pop();
}

function createChatCompletionChunk(id, model, content, finishReason = null) {
  return {
    id: id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [{ index: 0, delta: content ? { content: content } : {}, finish_reason: finishReason }]
  };
}

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: { message, type: 'api_error', code }
  }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI (WebUI)] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const apiKey = request.ctx.apiKey;
  const cookieStatus = request.ctx.cookie ? "✅ 已配置" : "❌ 未配置 (请在代码 CONFIG 中填写)";
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { --bg: #121212; --panel: #1E1E1E; --border: #333; --text: #E0E0E0; --primary: #FFBF00; --success: #66BB6A; --error: #CF6679; }
      body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .sidebar { width: 380px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
      .main { flex: 1; display: flex; flex-direction: column; padding: 20px; position: relative; }
      .box { background: #252525; padding: 15px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 20px; }
      .label { font-size: 12px; color: #888; margin-bottom: 8px; display: block; font-weight: 600; }
      .code-block { font-family: monospace; font-size: 12px; color: var(--primary); word-break: break-all; background: #111; padding: 10px; border-radius: 4px; cursor: pointer; }
      input, select, textarea { width: 100%; background: #333; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; }
      button { width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #000; }
      button:disabled { background: #555; cursor: not-allowed; }
      .chat-window { flex: 1; background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
      .msg { max-width: 85%; padding: 15px; border-radius: 8px; line-height: 1.6; word-wrap: break-word; }
      .msg.user { align-self: flex-end; background: #333; color: #fff; }
      .msg.ai { align-self: flex-start; background: #1a1a1a; border: 1px solid #333; }
      .msg.error { color: var(--error); border-color: var(--error); }
      .debug-panel { margin-top: 20px; border-top: 1px solid var(--border); padding-top: 20px; }
      .log-entry { font-family: monospace; font-size: 11px; border-bottom: 1px solid #333; padding: 5px 0; color: #aaa; }
      .log-entry.err { color: var(--error); }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="margin-top:0; display:flex; align-items:center; gap:10px;">
            ⚡ ${CONFIG.PROJECT_NAME} 
            <span style="font-size:12px;color:#888; font-weight:normal; margin-top:4px;">v${CONFIG.PROJECT_VERSION}</span>
        </h2>
        
        <div class="box">
            <span class="label">Cookie 状态</span>
            <div style="color: ${request.ctx.cookie ? 'var(--success)' : 'var(--error)'}; font-weight:bold;">${cookieStatus}</div>
        </div>

        <div class="box">
            <span class="label">API 密钥 (点击复制)</span>
            <div class="code-block" onclick="copy('${apiKey}')">${apiKey}</div>
        </div>

        <div class="box">
            <span class="label">API 接口地址</span>
            <div class="code-block" onclick="copy('${origin}/v1/chat/completions')">${origin}/v1/chat/completions</div>
        </div>

        <div class="box">
            <span class="label">模型选择 (建议选 Codex/Flash)</span>
            <select id="model">
                ${CONFIG.MODELS.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
            
            <span class="label">提示词 (Prompt)</span>
            <textarea id="prompt" rows="5" placeholder="输入你的问题...">你好，请介绍一下你自己。</textarea>
            
            <button id="btn-gen" onclick="sendRequest()">🚀 发送请求</button>
        </div>
        
        <div class="debug-panel">
            <span class="label">实时调试日志</span>
            <div id="debug-log" style="height: 150px; overflow-y: auto; background: #000; padding: 10px; border-radius: 4px;"></div>
        </div>
    </div>

    <main class="main">
        <div class="chat-window" id="chat">
            <div style="color:#666; text-align:center; margin-top:100px;">
                <div style="font-size:40px; margin-bottom:20px;">☁️</div>
                <h3>MixHub AI 代理服务就绪</h3>
                <p>支持 GPT-5 Codex, Gemini Flash 等模型。<br>请确保已在代码中配置有效的 Cookie。</p>
            </div>
        </div>
    </main>

    <script>
        const API_KEY = "${apiKey}";
        const ENDPOINT = "${origin}/v1/chat/completions";
        
        function copy(text) {
            navigator.clipboard.writeText(text);
            alert('已复制');
        }

        function log(type, msg) {
            const el = document.getElementById('debug-log');
            const div = document.createElement('div');
            div.className = \`log-entry \${type}\`;
            div.innerText = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
            el.appendChild(div);
            el.scrollTop = el.scrollHeight;
        }

        function appendMsg(role, text) {
            const div = document.createElement('div');
            div.className = \`msg \${role}\`;
            div.innerText = text;
            document.getElementById('chat').appendChild(div);
            div.scrollIntoView({ behavior: "smooth" });
            return div;
        }

        async function sendRequest() {
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt) return;

            const btn = document.getElementById('btn-gen');
            btn.disabled = true;
            btn.innerText = '⏳ 处理中...';

            if(document.querySelector('.chat-window').innerText.includes('代理服务就绪')) {
                document.getElementById('chat').innerHTML = '';
            }

            appendMsg('user', prompt);
            const aiMsg = appendMsg('ai', '');
            aiMsg.innerText = "▋";

            log('req', \`发送请求: \${prompt.substring(0, 20)}...\`);

            try {
                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + API_KEY, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        model: document.getElementById('model').value,
                        messages: [{ role: 'user', content: prompt }],
                        stream: true
                    })
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(\`HTTP \${res.status}: \${errText}\`);
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullText = "";
                aiMsg.innerText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices[0]?.delta?.content || "";
                                fullText += content;
                                aiMsg.innerText = fullText;
                            } catch (e) {}
                        }
                    }
                }
                log('res', '响应接收完成');

            } catch (e) {
                aiMsg.classList.add('error');
                aiMsg.innerText += \`\n[错误: \${e.message}]\`;
                log('err', e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = '🚀 发送请求';
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
