import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    last_sync: new Date().toISOString(),
    status: "mock",
  });
}
