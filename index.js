// 替换为你想代理的 YouTube 镜像站或原站
const upstream = 'yewtu.be' // 或者 invidious.nerdvpn.de 等其他实例

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    url.host = upstream

    const new_request = new Request(url.href, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })

    // 解决部分跨域和安全头问题
    let response = await fetch(new_request)
    let new_headers = new Headers(response.headers)
    new_headers.set('Access-Control-Allow-Origin', '*')
    new_headers.delete('content-security-policy')
    new_headers.delete('content-security-policy-report-only')
    new_headers.delete('clear-site-data')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new_headers
    })
  }
}
