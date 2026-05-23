if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input, init = {}) {
      this._url = typeof input === 'string' ? input : input?.url || ''
      this.method = init.method || 'GET'
      this._headers = new (globalThis.Headers || class Headers {})(init.headers || {})
      this._body = init.body || null
    }
    get url() { return this._url }
    get headers() { return this._headers }
    get body() { return this._body }
    async json() {
      if (typeof this._body === 'string') return JSON.parse(this._body)
      return this._body
    }
    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    }
  }
}

if (typeof globalThis.Response === 'undefined' || typeof globalThis.Response.json !== 'function') {
  const BaseResponse = globalThis.Response
  if (BaseResponse) {
    globalThis.Response = class Response extends BaseResponse {
      static json(data, init = {}) {
        const body = JSON.stringify(data)
        return new BaseResponse(body, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        })
      }
    }
    Object.defineProperty(globalThis.Response, 'name', { value: 'Response' })
  } else {
    globalThis.Response = class Response {
      constructor(body, init = {}) {
        this._body = body
        this.status = init?.status || 200
        this.statusText = init?.statusText || ''
        this._headers = new (globalThis.Headers || class Headers {})(init?.headers || {})
      }
      get headers() { return this._headers }
      get body() { return this._body }
      get ok() { return this.status >= 200 && this.status < 300 }
      async json() {
        if (typeof this._body === 'string') return JSON.parse(this._body)
        return this._body
      }
      async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
      }
      static json(data, init = {}) {
        return new Response(JSON.stringify(data), {
          ...init,
          headers: {
            ...init?.headers,
            'Content-Type': 'application/json',
          },
        })
      }
    }
  }
}

if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    constructor(init = {}) {
      this._headers = {}
      if (init instanceof globalThis.Headers) {
        init.forEach((value, key) => { this._headers[key.toLowerCase()] = value })
      } else if (typeof init === 'object' && init !== null) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key.toLowerCase()] = value
        })
      }
    }
    get(name) { return this._headers[name.toLowerCase()] || null }
    set(name, value) { this._headers[name.toLowerCase()] = value }
    has(name) { return name.toLowerCase() in this._headers }
    delete(name) { delete this._headers[name.toLowerCase()] }
    forEach(callback) { Object.entries(this._headers).forEach(([k, v]) => callback(v, k, this)) }
  }
}
