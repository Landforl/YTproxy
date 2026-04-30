export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. 如果是首页，展示一个简单的输入框
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(`
        <html>
          <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
            <h2>我的私人 YouTube 代理</h2>
            <input type="text" id="v" placeholder="贴入 YouTube 视频 ID (例如: dQw4w9WgXcQ)" style="width:300px; padding:10px;">
            <button onclick="window.location.href='/video/'+document.getElementById('v').value" style="padding:10px;">播放</button>
            <p style="color:gray; font-size:12px;">直接在链接后面加 /video/视频ID 也能看</p>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. 如果是播放请求
    if (url.pathname.startsWith("/video/")) {
      const videoId = url.pathname.split("/")[2];
      const youtubeUrl = `https://youtube.com{videoId}`;
      
      // 这里的逻辑是直接重定向到 YouTube 的嵌入式播放页面
      // 嵌入页 (embed) 的限制比原站少得多
      const embedUrl = `https://youtube.com{videoId}`;
      
      const response = await fetch(embedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        }
      });

      let html = await response.text();
      // 移除安全限制，防止在 iframe 里跑不起来
      html = html.replace(/content-security-policy/gi, "content-security-policy-disabled");

      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 3. 其他请求直接尝试转发到 YouTube
    const ytUrl = new URL(url.pathname + url.search, "https://youtube.com");
    return fetch(new Request(ytUrl, request));
  }
};
