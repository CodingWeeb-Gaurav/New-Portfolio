from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.0-flash"


async def stream_gemini_response(user_message: str, chat_history: list | None = None):
    """
    Async generator that yields ("token", text) tuples as tokens arrive
    from Gemini, using the conversation history for multi-turn context.
    """
    # Build the contents list for multi-turn conversation
    contents = []

    if chat_history:
        for msg in chat_history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["message"]}]
            })

    # Append the current user message
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })

    # Use the async streaming API
    async for chunk in await client.aio.models.generate_content_stream(
        model=MODEL,
        contents=contents,
    ):
        if chunk.text:
            yield ("token", chunk.text)
