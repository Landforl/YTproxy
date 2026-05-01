// 备选节点: inv.vern.cc, invidious.lunar.icu, invidious.projectsegfau.lt
const upstream = 'inv.pistasjis.net' 

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const targetUrl = new URL(url.pathname + url.search, `https://${upstream}`)

    const new_request = new Request(targetUrl, {
      method: request.method,
      headers: new Headers(request.headers),
      redirect: 'follow'
    })

    // 伪装头部，防止 403
    new_request.headers.set('Host', upstream)
    new_request.headers.set('Referer', `https://${upstream}/`)
    new_request.headers.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')

    try {
      let response = await fetch(new_request)
      
      // 修改返回内容，强制视频流通过你的 Worker 转发（解决黑屏关键）
      let new_headers = new Headers(response.headers)
      new_headers.set('Access-Control-Allow-Origin', '*')
      new_headers.delete('content-security-policy')
      new_headers.delete('content-security-policy-report-only')
      new_headers.delete('x-frame-options')

      return new Response(response.body, {
        status: response.status,
        headers: new_headers
      })
    } catch (e) {
      return new Response("节点连接失败，请在 index.js 中更换 upstream 域名", { status: 500 })
    }
  }
}
