from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.5-flash"


async def stream_gemini_response(
    system_prompt: str,
    chat_history: list,
    user_message: str,
    context_chunks: list | None = None,
):
    """
    Async generator for streaming Gemini response
    """

    contents = []

    # 🔹 SYSTEM PROMPT
    contents.append({
        "role": "user",
        "parts": [{"text": f"SYSTEM:\n{system_prompt}"}],
    })

    # 🔹 CHAT HISTORY (last 3 messages already trimmed outside)
    for msg in chat_history:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["message"]}],
        })

    # 🔹 CONTEXT CHUNKS (future semantic search)
    if context_chunks:
        joined_chunks = "\n\n".join(context_chunks)
        contents.append({
            "role": "user",
            "parts": [{"text": f"CONTEXT:\n{joined_chunks}"}],
        })

    # 🔹 CURRENT USER MESSAGE
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}],
    })

    # 🔹 STREAM RESPONSE
    async for chunk in await client.aio.models.generate_content_stream(
        model=MODEL,
        contents=contents,
    ):
        if chunk.text:
            yield ("token", chunk.text)