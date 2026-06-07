type ParsedPart = {
  name: string;
  filename?: string;
  mimeType?: string;
  data: Buffer;
};

export function parseMultipartForm(
  body: Buffer,
  contentType: string | undefined,
): { fields: Record<string, string>; files: ParsedPart[] } {
  if (!contentType?.includes("multipart/form-data")) {
    throw new Error("Expected multipart/form-data");
  }

  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = boundaryMatch?.[1] ?? boundaryMatch?.[2];
  if (!boundary) throw new Error("Missing multipart boundary");

  const delimiter = Buffer.from(`--${boundary}`);
  const chunks = splitBuffer(body, delimiter).filter((part) => part.length > 0 && !part.equals(Buffer.from("--")));

  const fields: Record<string, string> = {};
  const files: ParsedPart[] = [];

  for (const part of chunks) {
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;

    const headerText = part.subarray(0, headerEnd).toString("utf8");
    let data = part.subarray(headerEnd + 4);
    if (data.subarray(-2).equals(Buffer.from("\r\n"))) {
      data = data.subarray(0, data.length - 2);
    }

    const disposition = headerText.match(/content-disposition:[^\n]*/i)?.[0] ?? "";
    const nameMatch = disposition.match(/name="([^"]+)"/i);
    const fileMatch = disposition.match(/filename="([^"]*)"/i);
    const name = nameMatch?.[1];
    if (!name) continue;

    if (fileMatch) {
      const mimeType = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim();
      files.push({ name, filename: fileMatch[1], mimeType, data });
    } else {
      fields[name] = data.toString("utf8");
    }
  }

  return { fields, files };
}

function splitBuffer(buffer: Buffer, delimiter: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(delimiter, start);

  while (index !== -1) {
    if (index > start) parts.push(buffer.subarray(start, index));
    start = index + delimiter.length;
    if (buffer.subarray(start, start + 2).equals(Buffer.from("\r\n"))) start += 2;
    index = buffer.indexOf(delimiter, start);
  }

  if (start < buffer.length) parts.push(buffer.subarray(start));
  return parts;
}
