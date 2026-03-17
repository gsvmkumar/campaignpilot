import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "")

function buildBackendUrl(request: NextRequest, path: string[]) {
  const backendPath = path.join("/")
  const url = new URL(`${BACKEND_BASE_URL}/${backendPath}`)

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })

  return url
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const targetUrl = buildBackendUrl(request, path)

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: {
        Accept: request.headers.get("accept") ?? "application/json",
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "Backend returned an error response",
          target: targetUrl.toString(),
          status: upstream.status,
          body: text,
        },
        { status: upstream.status },
      )
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown backend connection error"
    return NextResponse.json(
      {
        error: "Backend request failed",
        target: targetUrl.toString(),
        message,
      },
      { status: 502 },
    )
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}
