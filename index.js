const upstream = 'inv.tux.pizza' // 换一个稍微冷门点的实例

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const targetUrl = new URL(url.pathname + url.search, `https://${upstream}`)

    const new_request = new Request(targetUrl, {
      method: request.method,
      headers: new Headers(request.headers), // 复制原请求头
      redirect: 'follow'
    })

    // 核心：伪装成真实的 iPad Safari 浏览器
    new_request.headers.set('Host', upstream)
    new_request.headers.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
    new_request.headers.set('Referer', `https://${upstream}/`)
    new_request.headers.set('Accept-Language', 'zh-CN,zh;q=0.9')

    let response = await fetch(new_request)

    // 如果还是 403，尝试移除可能暴露 Worker 身份的头
    let new_headers = new Headers(response.headers)
    new_headers.set('Access-Control-Allow-Origin', '*')
    new_headers.delete('content-security-policy')
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new_headers
    })
  }
}
