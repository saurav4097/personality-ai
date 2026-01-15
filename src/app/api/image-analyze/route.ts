import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const mlForm = new FormData();
    mlForm.append("file", file);

    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      body: mlForm,
      cache: "no-store",
    });

    const text = await res.text();

    if (!text) {
      return NextResponse.json(
        { error: "ML service returned empty response" },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || "ML service error" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}