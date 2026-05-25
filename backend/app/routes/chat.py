from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from app.database import db
from app.services.llm_gemini import stream_gemini_response
from app.services.top_chunks import get_relevant_chunks
router = APIRouter(prefix="/chat", tags=["Chatbot"])


SYSTEM_PROMPT = SYSTEM_PROMPT = """
You are an AI assistant for Gaurav's developer portfolio.

Your job is to help recruiters and visitors understand:

- Gaurav's projects
- technical skills
- experience
- education
- achievements
- interests

Rules:
- Answer professionally and concisely
- Prefer information from retrieved context chunks
- Do not invent projects or experiences
- If information is unavailable, say:
  "I do not have enough information about that."
- Keep responses natural and conversational
"""


@router.websocket("/ws")
async def chat_ws(websocket: WebSocket):
    await websocket.accept()

    try:
        # 🔹 STEP 1: RECEIVE INITIAL HANDSHAKE (chatId only)
        init_data = await websocket.receive_json()
        chat_id = init_data["chatId"]

        # 🔹 LOAD HISTORY
        session = await db.chat_sessions.find_one({"_id": chat_id}) or {}
        history = session.get("chatHistory", [])

        def serialize_history(history):
            return [
                {
                    "role": msg["role"],
                    "message": msg["message"],
                    "timestamp": msg["timestamp"].isoformat()
                    if "timestamp" in msg else None,
                }
                for msg in history
            ]


        await websocket.send_json({
            "type": "history",
            "messages": serialize_history(history),
        })

        # 🔹 MAIN LOOP
        while True:
            data = await websocket.receive_json()

            user_message = data.get("message")

            if not user_message:
                continue

            # 🔹 APPEND USER MESSAGE
            history.append({
                "role": "user",
                "message": user_message,
                "timestamp": datetime.utcnow(),
            })

            # 🔹 LAST 3 MESSAGES ONLY FOR CONTEXT
            last_messages = history[-4:-1]

            try:
                context_chunks = get_relevant_chunks(
                    user_message,
                    k=3
                )
            except Exception as e:
                import traceback
                traceback.print_exc() # Log the full stack trace for debugging
                context_chunks = []

            ai_response = ""

            # 🔹 STREAM FROM GEMINI
            async for event in stream_gemini_response(
                SYSTEM_PROMPT,
                last_messages,
                user_message,
                context_chunks,
            ):
                if event[0] == "token":
                    await websocket.send_text(event[1])
                    ai_response += event[1]

            # 🔹 SAVE AI RESPONSE
            history.append({
                "role": "ai",
                "message": ai_response,
                "timestamp": datetime.utcnow(),
            })

            history = history[-20:]

            await db.chat_sessions.update_one(
                {"_id": chat_id},
                {
                    "$set": {
                        "chatHistory": history,
                        "updated_at": datetime.utcnow(),
                    }
                },
                upsert=True,
            )

            await websocket.send_text("__END__")

    except WebSocketDisconnect:
        print("Chat disconnected")