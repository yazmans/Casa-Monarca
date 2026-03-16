import { NextResponse, NextRequest } from "next/server";
import { execFile } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const scriptPath = path.join(process.cwd(), "backend", "optimize.py");
  const stdin = JSON.stringify(body.params ?? {});

  return new Promise<NextResponse>((resolve) => {
    const child = execFile(
      "/Library/Frameworks/Python.framework/Versions/3.14/bin/python3",
      [scriptPath],
      { timeout: 120_000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          resolve(
            NextResponse.json(
              { status: "Error", error: stderr || error.message },
              { status: 500 }
            )
          );
          return;
        }
        try {
          resolve(NextResponse.json(JSON.parse(stdout)));
        } catch {
          resolve(
            NextResponse.json(
              { status: "Error", error: "Respuesta invalida del solver" },
              { status: 500 }
            )
          );
        }
      }
    );
    child.stdin?.write(stdin);
    child.stdin?.end();
  });
}
