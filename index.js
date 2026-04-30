const upstream = 'yewtu.be' // 你可以换成任何 Invidious 实例

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const targetUrl = new URL(url.pathname + url.search, `https://${upstream}`)

    const new_request = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      redirect: 'follow'
    })

    // 关键：修改 Host 头，否则后端服务器会拒绝访问
    new_request.headers.set('Host', upstream)
    new_request.headers.set('Referer', `https://${upstream}/`)

    let response = await fetch(new_request)
    
    // 允许跨域并移除安全限制，防止白屏
    let new_headers = new Headers(response.headers)
    new_headers.set('Access-Control-Allow-Origin', '*')
    new_headers.delete('content-security-policy')
    new_headers.delete('content-security-policy-report-only')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new_headers
    })
  }
}
